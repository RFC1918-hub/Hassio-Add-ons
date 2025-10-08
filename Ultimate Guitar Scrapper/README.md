# Home Assistant Add-on: Ultimate Guitar Scraper

## About

Ultimate-Guitar.com is the world's largest online database of guitar tablature. This add-on provides a clean, ad-free interface to access and manage guitar tabs.

## Features

- Clean, ad-free interface for Ultimate Guitar tabs
- Search and fetch tabs by ID or URL
- Export tabs in various formats
- Built with Go and Node.js for optimal performance
- Version 3.0.1

## OnSong Format

This add-on now supports a new OnSong format, which provides a clean, text-based representation of the song, including the title, artist, key, tempo, and formatted chords and sections. To use this format, run the following command:

`./ultimate-guitar-scraper onsong -id {tabId}`

## Installation

1. Add this repository to your Home Assistant instance
2. Install the Ultimate Guitar Scraper add-on
3. Start the add-on
4. Click "OPEN WEB UI" to access the interface (port 3000)

## Usage

The add-on provides a web interface where you can:
- Search for tabs
- View tabs without ads
- Export tabs in various formats
- Save your favorite tabs

## Support

Got questions or need help? [Open an issue on our GitHub repository](https://github.com/RFC1918-hub/Hassio-Add-ons/issues)

## Disclaimer

This add-on is not affiliated with, authorized, or endorsed by Ultimate-Guitar.com. It is provided for educational purposes only.

This package allows you to programmatically fetch tabs and do pretty much whatever you want with them depending on the data structure of the response. 

#### Potential use-cases might include...

- CLI tab viewer/manager  
- A utility that calculates the most used chords or progressions in a specific set of songs  
- Automatic transposition service  
- A tab "player" - similar to the "GuitarPro" application  
- Save text-based tabs + associated meta  
- Generate and save HTML, PDF, etc tabs  
- Download tabs then upload to popular services like Google Drive, Dropbox, etc  

### Features  

- [X] Commandline interface (WIP)
- [X] Fetch a tab by id  
- [X] Fetch all your saved tabs.
- [X] Fetch tab by URL
- [X] Search for tabs  
- [X] Explore popular tabs  
- [X] Export tab as `.wav` (Thanks to [https://github.com/timiskhakov/music](https://github.com/timiskhakov/music))!!  
- [X] Fetch popular tabs (see: `ultimateguitar.Explore`)  
- [ ] Scrape all tabs by artist  
  -  Fun fact: on mobile, UG doesn't have a "list tabs by artist name/id" endpoint. They just load ~7 pages. Weird. The functionality for this is technically here already, I just didn't add a helper method. Go nuts.  

### Building  

1. `go build` (lol)  

### Using the CLI  

Run `./ultimate-guitar-scraper -h` if you're curious, buuuut...

- Fetch a tab: `./ultimate-guitar-scraper fetch -id 96835 -output wee.wav`  
- Fetch all your saved tabs: `./ultimate-guitar-scraper get_all --output ./out`  
- Fetch and export tab as HTML (using `cmd/data/template.tmpl`): `./ultimate-guitar-scraper export -id 96835`  
- Fetch a tab and export it as a .wav file: `./ultimate-guitar-scraper wav -id 113039 -output hallelujah.wav`  


#### ... But why?  

As much as I appreciate the work UG has done compiling the largest online guitar tabs database, I can't bring myself to use their website or mobile app (and definitely not their website on mobile!). I started working on this package (originally a node module) as a way for me to view tabs/chord charts without dealing with their display ads and interstitials.  


#### Technology Used

- Golang (duh)  
- Frida - [https://frida.re/](https://frida.re/)  
- JEB Decompiler - [https://www.pnfsoftware.com/jeb/android](https://www.pnfsoftware.com/jeb/android)  
- Charles / mitmproxy  
- This awesome experimental package: https://github.com/timiskhakov/music  


## Disclaimer / Legal  

This software's purpose is purely educational. I am not responsible for how you use this package. This repository and all others associated with it are not affiliated with, authorized, or endorsed by Ultimate-Guitar.com. 


