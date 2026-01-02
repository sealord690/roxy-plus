# Roxy+ 🚀

Advanced Discord Selfbot - 2026 Edition

## Project Structure

```
roxy+/
├── index.js              # Main entry point
├── package.json          # Project dependencies
├── .env                  # Environment variables (TOKEN, PREFIX)
├── commands/             # Command modules
│   ├── ping.js
│   └── help.js
├── dashboard/            # Web dashboard files
├── data/                 # JSON data storage
└── config/               # Configuration files
```

## Setup

1. Install dependencies:
```bash
npm install discord.js-selfbot-v13 dotenv
```

2. Configure your token in `.env`:
```
TOKEN=your_discord_token_here
PREFIX=!
```

3. Run the bot:
```bash
npm start
```

## Available Commands

- `!ping` - Check bot latency
- `!help` - List all available commands

## Development

This is a modular selfbot built with clean architecture. Each command is a separate module in the `commands/` directory.

To add a new command, create a new file in `commands/` with the following structure:

```javascript
module.exports = {
    name: 'commandname',
    description: 'Command description',
    async execute(message, args, client) {
        // Command logic here
    }
};
```

---
Built for 2026 🔥
