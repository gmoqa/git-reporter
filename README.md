# Git Reporter

A web tool that generates dynamic changelogs from git commit history.

[gitreporter.com](https://gitreporter.com)

## Features

- Parse git log output into structured changelogs
- Support for Conventional Commits format
- Two modes of operation:
  - **Manual**: Paste git log output directly
  - **Integrated**: Connect your GitHub, GitLab, or Bitbucket account to analyze repositories
- Date range filtering
- Real-time markdown preview
- Export-ready changelog format

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env

# Generate AUTH_SECRET
openssl rand -base64 32

# Add to .env along with OAuth credentials (see docs/SETUP.md)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Documentation

- **[Setup Guide](docs/SETUP.md)** - Complete installation and OAuth configuration
- **[Architecture](docs/ARCHITECTURE.md)** - Technical implementation details
- **[Features](docs/FEATURES.md)** - Repository integration documentation
- **[CLAUDE.md](CLAUDE.md)** - Developer reference for AI assistants

## Usage

### Manual Mode (No Login)

1. Run this git command in your repository:
```bash
git --no-pager log --all --oneline --pretty=format:"%h %an %ad %s" --date=format-local:"%Y-%m-%d %H:%M:%S"
```

2. Paste the output into the text area
3. Click "Process"
4. View and copy the generated changelog

### Integrated Mode (With Login)

1. Login with GitHub, GitLab, or Bitbucket
2. Select your organization/user
3. Search and select a repository
4. Commits are automatically fetched and processed
5. Apply date filters as needed

## Tech Stack

- Next.js 16 with App Router
- React 19.2
- Chakra UI v3
- Auth.js v5 (OAuth)
- Turbopack

## Requirements

- Node.js 18+
- OAuth application credentials (see [Setup Guide](docs/SETUP.md))

## Development

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm start           # Start production server
npm run lint        # Lint code
npm run format      # Check formatting
npm run format:fix  # Fix formatting
```

## Contributing

Suggestions and bug reports welcome at: gu.quinteros@gmail.com

## License

MIT
