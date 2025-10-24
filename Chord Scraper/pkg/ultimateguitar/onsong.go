package ultimateguitar

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/RFC1918-hub/Hassio-Add-ons/chord-scraper/pkg/chordanalysis"
)

// ConvertToOnSong converts a TabResult to OnSong format with chord analysis
func (tab *TabResult) ConvertToOnSong() string {
	var output strings.Builder

	// Replace the syntax delimiters for OnSong first
	tabOut := strings.ReplaceAll(tab.Content, "[tab]", "")
	tabOut = strings.ReplaceAll(tabOut, "[/tab]", "")
	tabOut = strings.ReplaceAll(tabOut, "[ch]", "[")
	tabOut = strings.ReplaceAll(tabOut, "[/ch]", "]")

	// Convert section headers from [Section Name] to Section Name:
	sectionPattern := regexp.MustCompile(`(?mi)^\[(Intro|Verse\s*\d*|Chorus\s*\d*|Pre-Chorus|Bridge|Instrumental|Interlude|Turnaround|Outro|Tag|Ending|Solo|Break|Refrain|Coda|Hook|Vamp|Outro Chorus)\]\s*$`)
	tabOut = sectionPattern.ReplaceAllString(tabOut, "$1:")

	// Perform chord analysis
	analysis := chordanalysis.AnalyzeChords(tabOut)

	// Header: Song name, artist
	output.WriteString(tab.SongName + "\n")
	output.WriteString(tab.ArtistName + "\n")

	// Always use detected key if available to match Nashville Number System
	// Otherwise fall back to the provided key from Ultimate Guitar
	keyToUse := tab.TonalityName
	if analysis.DetectedKey != "" {
		keyToUse = analysis.DetectedKey
	}

	output.WriteString("Key: " + keyToUse + "\n")
	output.WriteString("Tempo: 100 BPM\n")
	output.WriteString("Time Signature: 4/4\n")

	// Add Nashville Number System analysis (one-liner)
	if len(analysis.ChordProgressions) > 0 {
		var nashvillePairs []string
		for _, prog := range analysis.ChordProgressions {
			nashvillePairs = append(nashvillePairs, fmt.Sprintf("%s=%s", prog.Chord, prog.NashvilleNum))
		}
		output.WriteString("Nashville Number System: " + strings.Join(nashvillePairs, ", ") + "\n")

		// Add general progression (most common pattern)
		var progPattern []string
		for _, prog := range analysis.ChordProgressions {
			progPattern = append(progPattern, prog.NashvilleNum)
		}
		output.WriteString("General Progression: " + strings.Join(progPattern, " - ") + "\n")
	}
	output.WriteString("\n")

	// Add the tab content
	output.WriteString(tabOut)

	return output.String()
}

// GetTabByIDAsOnSong fetches a tab and converts it to OnSong format in one call
func (s *Scraper) GetTabByIDAsOnSong(tabID int64) (string, error) {
	tab, err := s.GetTabByID(tabID)
	if err != nil {
		return "", fmt.Errorf("failed to fetch tab: %w", err)
	}

	return tab.ConvertToOnSong(), nil
}
