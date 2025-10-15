package cmd

import (
	"fmt"
	"log"
	"regexp"
	"strings"

	"github.com/Pilfer/ultimate-guitar-scraper/pkg/ultimateguitar"
	"github.com/urfave/cli"
)

var Onsong = cli.Command{
	Name:        "onsong",
	Usage:       "ug onsong -id {tabId}",
	Description: "Fetch a tab from ultimate-guitar.com by id and format it for OnSong",
	Aliases:     []string{"o"},
	Flags: []cli.Flag{
		cli.Int64Flag{
			Name:  "id",
			Value: 1947141,
			Usage: "",
		},
	},
	Action: onsong,
}

func onsong(c *cli.Context) {
	var tabID int64

	if c.IsSet("id") {
		tabID = c.Int64("id")
	}

	s := ultimateguitar.New()
	tab, err := s.GetTabByID(tabID)

	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(tab.SongName)
	fmt.Println(tab.ArtistName)
	fmt.Println("Key: " + tab.TonalityName)
	fmt.Println("Tempo: 100 BPM")
	fmt.Println("")

	// Replace the syntax delimiters for OnSong
	tabOut := strings.ReplaceAll(tab.Content, "[tab]", "")
	tabOut = strings.ReplaceAll(tabOut, "[/tab]", "")
	tabOut = strings.ReplaceAll(tabOut, "[ch]", "[")
	tabOut = strings.ReplaceAll(tabOut, "[/ch]", "]")

	// Convert section headers from [Section Name] to Section Name:
	// Match lines that contain only a section label in brackets
	sectionPattern := regexp.MustCompile(`(?mi)^\[(Intro|Verse\s*\d*|Chorus\s*\d*|Pre-Chorus|Bridge|Instrumental|Interlude|Turnaround|Outro|Tag|Ending|Solo|Break|Refrain|Coda|Hook|Vamp|Outro Chorus)\]\s*$`)
	tabOut = sectionPattern.ReplaceAllString(tabOut, "$1:")

	fmt.Println(tabOut)
}
