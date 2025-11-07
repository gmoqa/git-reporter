# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Git Reporter ([gitreporter.com](https://gitreporter.com)) is a web tool that generates dynamic changelogs from git log output. It parses git logs following the Conventional Commits standard and generates formatted markdown changelogs.

## Quick Start

```bash
# Install dependencies (requires flag for peer dependencies)
npm install --legacy-peer-deps

# Setup environment
cp .env.example .env
# Add at minimum: AUTH_SECRET and GITHUB_CLIENT_ID/SECRET

# Start development
npm run dev
```

## Development Commands

```bash
npm run dev         # Start development server (Turbopack)
npm run build       # Build for production
npm start           # Start production server
npm run lint        # Lint code
npm run format      # Check code formatting
npm run format:fix  # Fix code formatting
```

## Documentation

Detailed documentation is available in the `docs/` folder:

- **[docs/SETUP.md](docs/SETUP.md)** - Complete setup guide including OAuth configuration
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Technical architecture and implementation details
- **[docs/FEATURES.md](docs/FEATURES.md)** - Repository integration feature documentation

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **React**: 19.2
- **UI**: Chakra UI v3 with next-themes
- **Auth**: Auth.js v5 with GitHub, GitLab, Bitbucket OAuth
- **Security**: reCAPTCHA v3 (skipped in development)

## Key Concepts

### Two Modes of Operation

1. **Manual Input** (No auth): User pastes git log output → client-side processing
2. **Repository Integration** (Authenticated): User selects repo → API fetches commits → processing

### Provider Pattern

The codebase uses a Provider Pattern for scalable Git platform integration:

```
src/services/providers/
├── BaseProvider.js          # Interface
├── GitHubProvider.js        # GitHub implementation
├── GitLabProvider.js        # GitLab implementation
├── BitbucketProvider.js     # Bitbucket implementation
└── ProviderFactory.js       # Factory
```

All API routes in `/api/repos/*` automatically use the correct provider based on user's session.

### Processing Pipeline

```
Raw Git Log → processLog() → filterLog() → getFeatures()/getFixes() → generateMarkdown() → Preview
```

Key files:
- `src/app/utils/gitLogParser.js` - Parsing logic
- `src/app/utils/markdownGenerator.js` - Markdown generation
- `src/app/page.js` - Main application logic

### Authentication

- Auth.js v5 manages OAuth flow
- Access tokens stored in encrypted JWT sessions
- Tokens used by providers to call Git platform APIs
- Middleware protects `/api/repos/*` routes

See `src/auth.js` for configuration.

## Important Notes

### Installation
Always use `--legacy-peer-deps` flag when installing packages due to next-recaptcha-v3 peer dependency constraints.

### Environment Variables
- `AUTH_SECRET` - Required for JWT signing (generate with `openssl rand -base64 32`)
- At least one OAuth provider required (GITHUB_CLIENT_ID/SECRET recommended)
- reCAPTCHA optional (validation skipped in development)

See `.env.example` for complete list.

### Git Log Format

The application expects git log in this format:
```bash
git --no-pager log --all --oneline --pretty=format:"%h %an %ad %s" --date=format-local:"%Y-%m-%d %H:%M:%S"
```

Output: `<hash> <author> <date> <subject>`

### Conventional Commits

Parser expects commits following [Conventional Commits](https://www.conventionalcommits.org/):
```
type(scope): subject
```

Types: feat, fix, docs, style, refactor, test, chore, perf

## Code Style

- No semicolons (Prettier enforced)
- Single quotes for strings and JSX
- 2-space indentation
- PascalCase for components, camelCase for utilities

## Adding Features

### New Git Provider
1. Create class extending `BaseProvider` in `src/services/providers/`
2. Implement all interface methods
3. Add to `ProviderFactory.js`
4. Configure OAuth in `src/auth.js`

See `docs/FEATURES.md` for detailed guide.

### New Component
- Place in `src/app/components/`
- Use Chakra UI v3 components
- Follow existing patterns for consistency

### New API Route
- Create in `src/app/api/`
- Use `auth()` from `@/auth` for protected routes
- Return JSON responses with proper error handling

## Testing & Debugging

Currently no test suite. When testing:
1. Test both manual and authenticated flows
2. Test all OAuth providers if modified
3. Test date filtering in both modes
4. Verify error handling and loading states

## Deployment

- Update OAuth callback URLs for production domain
- Set environment variables in hosting platform
- Ensure AUTH_SECRET is unique for production
- reCAPTCHA validation is enforced in production

## Need Help?

Refer to detailed documentation:
- Setup issues → `docs/SETUP.md`
- Architecture questions → `docs/ARCHITECTURE.md`
- Provider integration → `docs/FEATURES.md`
