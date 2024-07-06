# TwitchSync Pro

TwitchSync Pro is a suite of web applications designed to enhance your Twitch viewing and chat experience. It consists of two main components: TwitchSync Pro (chat-only) and TwitchSync Pro Video.

## Features

### TwitchSync Pro (Chat-only)
- Connect to any Twitch channel's chat
- Real-time chat display
- Chat statistics (message count, unique users)
- Send messages to the chat (requires Twitch login)

### TwitchSync Pro Video
- All features of the chat-only version
- Embedded Twitch video player
- Synchronized chat and video experience

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Twitch account (for sending messages)

### Installation
1. Clone this repository or download the files.
2. Place the files on a web server or open them locally in your browser.

### Usage

#### TwitchSync Pro (Chat-only)
1. Open `TwitchSync.html` in your web browser.
2. Enter a Twitch username in the input field and click "Connect".
3. The chat for the specified channel will appear in the main window.

#### TwitchSync Pro Video
1. Open `TwitchSyncVideo.html` in your web browser.
2. Enter a Twitch username in the input field and click "Connect".
3. The Twitch stream and chat for the specified channel will appear.

### Sending Messages
To send messages in the chat:
1. Click the "Log in to Twitch" button.
2. Follow the instructions to obtain your OAuth token from Twitch.
3. Enter your Twitch username and OAuth token in the login modal.
4. Once logged in, you can type messages in the input field at the bottom and click "Send" or press Enter.

## File Structure

```
├── ChatAndVideo/
└── TwitchSyncVideo.html
├── css/
│   └── styles.css
└── scripts/
    └── script.js

------------------------

├── JustChat/
└── TwitchSync.html
├── css/
│   └── styles.css
└── scripts/
    └── script.js
```

## Dependencies
- [tmi.js](https://github.com/tmijs/tmi.js) - Twitch Messaging Interface library
- [Twitch Embed API](https://dev.twitch.tv/docs/embed) - For video player integration

## Security Note
The OAuth token provides access to your Twitch account. Never share this token with others or commit it to version control systems.

## Contributing
Contributions to TwitchSync Pro are welcome! Please feel free to submit a Pull Request.

## License
This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments
- Twitch for providing the APIs and embed functionality
- The tmi.js team for their excellent Twitch chat integration library
