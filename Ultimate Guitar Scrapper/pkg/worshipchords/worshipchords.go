package worshipchords

import (
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"

	"golang.org/x/net/html"
)

// Song represents a worship song with chords
type Song struct {
	Title   string
	Artist  string
	Key     string
	Content string
	URL     string
}

// Client handles requests to worshipchords.com
type Client struct {
	httpClient *http.Client
}

// New creates a new worshipchords client
func New() *Client {
	return &Client{
		httpClient: &http.Client{},
	}
}

// GetSongFromURL fetches and parses a song from worshipchords.com
func (c *Client) GetSongFromURL(url string) (*Song, error) {
	// Validate URL
	if !strings.Contains(url, "worshipchords.com") {
		return nil, fmt.Errorf("invalid URL: must be from worshipchords.com")
	}

	// Fetch the page
	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch URL: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch URL: status code %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Parse the HTML
	song, err := c.parseHTML(string(body), url)
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %w", err)
	}

	return song, nil
}

// parseHTML extracts song information from the HTML content
func (c *Client) parseHTML(htmlContent string, url string) (*Song, error) {
	doc, err := html.Parse(strings.NewReader(htmlContent))
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %w", err)
	}

	song := &Song{URL: url}

	// Find the title
	song.Title = findMetaContent(doc, "og:title")
	if song.Title == "" {
		song.Title = findTitle(doc)
	}

	// Extract song name and artist from title
	// Format is usually "Song Name Chords - Artist Name"
	if strings.Contains(song.Title, " - ") {
		parts := strings.Split(song.Title, " - ")
		songName := strings.TrimSpace(strings.Replace(parts[0], " Chords", "", 1))
		artistName := strings.TrimSpace(parts[1])
		song.Title = songName
		song.Artist = artistName
	}

	// Find the chord content
	chordContent := findSongChords(doc)
	if chordContent == "" {
		return nil, fmt.Errorf("no chord content found")
	}

	// Extract key if present
	song.Key = extractKey(chordContent)

	// Format the content
	song.Content = formatChordContent(chordContent)

	return song, nil
}

// findSongChords finds the div with class="song-chords-content" and extracts the pre element
func findSongChords(n *html.Node) string {
	if n.Type == html.ElementNode && n.Data == "div" {
		for _, attr := range n.Attr {
			if attr.Key == "class" && strings.Contains(attr.Val, "song-chords-content") {
				// Found the div, now find the pre element
				return findPreContent(n)
			}
		}
	}

	for c := n.FirstChild; c != nil; c = c.NextSibling {
		result := findSongChords(c)
		if result != "" {
			return result
		}
	}

	return ""
}

// findPreContent finds pre element and extracts its text content
func findPreContent(n *html.Node) string {
	if n.Type == html.ElementNode && n.Data == "pre" {
		return extractText(n)
	}

	for c := n.FirstChild; c != nil; c = c.NextSibling {
		result := findPreContent(c)
		if result != "" {
			return result
		}
	}

	return ""
}

// extractText extracts all text content from a node, preserving structure
func extractText(n *html.Node) string {
	var sb strings.Builder

	var traverse func(*html.Node)
	traverse = func(node *html.Node) {
		if node.Type == html.TextNode {
			sb.WriteString(node.Data)
		} else if node.Type == html.ElementNode {
			if node.Data == "br" {
				sb.WriteString("\n")
			}
		}

		for c := node.FirstChild; c != nil; c = c.NextSibling {
			traverse(c)
		}
	}

	traverse(n)
	return sb.String()
}

// findMetaContent finds meta tag content by property name
func findMetaContent(n *html.Node, property string) string {
	if n.Type == html.ElementNode && n.Data == "meta" {
		var prop, content string
		for _, attr := range n.Attr {
			if attr.Key == "property" && attr.Val == property {
				prop = attr.Val
			}
			if attr.Key == "content" {
				content = attr.Val
			}
		}
		if prop == property && content != "" {
			return content
		}
	}

	for c := n.FirstChild; c != nil; c = c.NextSibling {
		result := findMetaContent(c, property)
		if result != "" {
			return result
		}
	}

	return ""
}

// findTitle finds the title element
func findTitle(n *html.Node) string {
	if n.Type == html.ElementNode && n.Data == "title" {
		if n.FirstChild != nil && n.FirstChild.Type == html.TextNode {
			return n.FirstChild.Data
		}
	}

	for c := n.FirstChild; c != nil; c = c.NextSibling {
		result := findTitle(c)
		if result != "" {
			return result
		}
	}

	return ""
}

// extractKey attempts to find the key in the content
func extractKey(content string) string {
	// Look for "data-key" attribute in the content
	keyRegex := regexp.MustCompile(`data-key="([^"]+)"`)
	matches := keyRegex.FindStringSubmatch(content)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}

// formatChordContent cleans up and formats the chord content for OnSong
func formatChordContent(content string) string {
	// Split into lines
	lines := strings.Split(content, "\n")
	var formatted []string

	for _, line := range lines {
		// Trim whitespace from the right
		cleaned := strings.TrimRight(line, " \t")

		// Skip empty lines at the beginning, but preserve them within content
		if len(formatted) == 0 && cleaned == "" {
			continue
		}

		formatted = append(formatted, cleaned)
	}

	// Join lines back together
	result := strings.Join(formatted, "\n")

	// Clean up excessive blank lines (more than 2 consecutive)
	result = regexp.MustCompile(`\n{3,}`).ReplaceAllString(result, "\n\n")

	return strings.TrimSpace(result)
}
