# Jellyseerr Home Assistant Add-on

[Jellyseerr](https://github.com/Fallenbagel/jellyseerr) is a free and open-source media request and management system built to work with Jellyfin and Plex. This add-on allows you to run Jellyseerr directly within Home Assistant OS.

## 📦 About

- **Name**: Jellyseerr
- **Version**: 1.0.0
- **Web UI**: http://[YOUR-HOME-ASSISTANT-IP]:5055
- **Docker Image**: `fallenbagel/jellyseerr:latest`

## 🛠 Features

- Manage media requests for Jellyfin and Plex
- User-friendly web interface
- Seamless integration with existing media servers
- Runs as a Home Assistant add-on

## 📁 Configuration

No additional configuration is required. The default settings will start Jellyseerr on port **5055**.

If you need to persist settings or media metadata, the add-on maps the following folders:

- `/addon_config` → Add-on configuration and internal data
- `/media` → Optional media path access (read/write)

## 🚀 Installation

1. Clone this repository or add it as a custom add-on repository in Home Assistant.
2. Install the Jellyseerr add-on from the Add-on Store.
3. Start the add-on.
4. Open the web UI: `http://[YOUR-HOST]:5055`

## 🔒 Ports

- `5055/tcp`: Jellyseerr Web Interface

## 🧰 Useful Links

- [Jellyseerr Documentation](https://docs.jellyseerr.dev)
- [Jellyseerr GitHub](https://github.com/Fallenbagel/jellyseerr)

---

**Enjoy requesting and managing your media collection with Jellyseerr!**
