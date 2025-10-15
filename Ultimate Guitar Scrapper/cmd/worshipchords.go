package cmd

import (
	"fmt"
	"log"

	"github.com/Pilfer/ultimate-guitar-scraper/pkg/worshipchords"
	"github.com/urfave/cli"
)

var Worshipchords = cli.Command{
	Name:        "worshipchords",
	Usage:       "ug worshipchords -url {url}",
	Description: "Fetch a song from worshipchords.com and format it for OnSong",
	Aliases:     []string{"wc"},
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "url",
			Value: "",
			Usage: "URL of the song on worshipchords.com",
		},
	},
	Action: worshipchordsAction,
}

func worshipchordsAction(c *cli.Context) {
	var url string

	if c.IsSet("url") {
		url = c.String("url")
	}

	if url == "" {
		log.Fatal("URL is required. Use -url flag to specify a worshipchords.com URL")
	}

	client := worshipchords.New()
	song, err := client.GetSongFromURL(url)

	if err != nil {
		log.Fatal(err)
	}

	// Output in OnSong format
	fmt.Println(song.Title)
	if song.Artist != "" {
		fmt.Println(song.Artist)
	}
	if song.Key != "" {
		fmt.Println("Key: " + song.Key)
	}
	fmt.Println("Tempo: 100 BPM")
	fmt.Println("")
	fmt.Println(song.Content)
}
