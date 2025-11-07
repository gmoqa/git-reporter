# Architecture Documentation

Technical architecture and implementation details for Git Reporter.

## Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **React**: Version 19.2
- **UI Library**: Chakra UI v3 with Emotion for styling
- **Theme**: next-themes for color mode management
- **Authentication**: Auth.js v5 (NextAuth) with OAuth providers
- **Security**: Google reCAPTCHA v3 (via next-recaptcha-v3)
- **Analytics**: Google Tag Manager
- **Icons**: react-icons (FaCalendar, FaCopy, FaFilter, FaGithub, etc.)

## Application Flow

The application supports two modes of operation:

### Mode 1: Manual Input (No Authentication)
1. User runs git log command locally
2. Pastes output into textarea
3. reCAPTCHA validation (production only)
4. Client-side processing pipeline:
   - `processLog()` → Parse raw git log
   - `filterLog()` → Remove invalid commits
   - `getFeatures()` / `getFixes()` → Extract by type
   - `generateMarkdown()` → Generate preview
5. Live markdown preview

### Mode 2: Repository Integration (Authenticated)
1. User logs in with GitHub/GitLab/Bitbucket
2. Selects organization/user
3. Searches and selects repository
4. Commits fetched via API
5. Same processing pipeline as Mode 1
6. Date filters can be applied to refetch from API

## Provider Services Architecture

The application uses a **Provider Pattern** (Strategy Pattern) for scalable integration with different Git platforms.

### Structure
```
src/services/providers/
├── BaseProvider.js          # Abstract base class (interface)
├── GitHubProvider.js        # GitHub API v3 implementation
├── GitLabProvider.js        # GitLab API v4 implementation
├── BitbucketProvider.js     # Bitbucket Cloud API 2.0 implementation
└── ProviderFactory.js       # Factory pattern for provider creation
```

### Base Provider Interface

All providers must implement:

```javascript
class BaseProvider {
  // Get authenticated user information
  async getCurrentUser()

  // Get user's organizations/workspaces
  async getOrganizations()

  // Get repositories for a user/org
  async getRepositories(owner)

  // Search repositories with query
  async searchRepositories(query, owner)

  // Get commits from repository
  async getCommits(owner, repo, { since, until, branch })
}
```

### Provider Factory

Creates appropriate provider instance based on session:

```javascript
const provider = ProviderFactory.createProvider(
  session.provider,    // 'github' | 'gitlab' | 'bitbucket'
  session.accessToken  // OAuth access token
)
```

### Adding New Providers

See `docs/FEATURES.md` for step-by-step guide on adding new Git platforms.

## Authentication Architecture

### Auth.js v5 Setup

**Configuration** (`src/auth.js`):
```javascript
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({ /* ... */ }),
    GitLab({ /* ... */ }),
    Bitbucket({ /* ... */ })
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Store access token in JWT
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      return token
    }
  }
})
```

**Middleware** (`middleware.js`):
- Protects API routes requiring authentication
- Runs on `/api/repos/*` paths

**Session Access**:
```javascript
// Server-side
const session = await auth()
const accessToken = session.accessToken
const provider = session.provider

// Client-side
import { useSession } from 'next-auth/react'
const { data: session } = useSession()
```

### OAuth Flow

1. User clicks login button
2. Redirects to OAuth provider
3. User authorizes application
4. Provider redirects back with auth code
5. Auth.js exchanges code for access token
6. Token stored in encrypted JWT session
7. Token used for API calls to Git platform

## API Routes

### Authentication
- `GET/POST /api/auth/[...nextauth]` - Auth.js handlers

### Repository Integration
- `GET /api/repos/organizations` - List user's orgs/workspaces
- `GET /api/repos/list?owner=...&search=...` - List/search repos
- `GET /api/repos/commits?owner=...&repo=...&since=...&until=...` - Get commits

### Security
- `POST /api/validate` - reCAPTCHA token validation

All `/api/repos/*` routes:
1. Verify session authentication
2. Extract access token and provider from session
3. Create provider instance via Factory
4. Call provider methods
5. Return standardized response

## Git Log Processing

### Parser (`src/app/utils/gitLogParser.js`)

**Input Format:**
```
<hash> <author> <date> <subject>
```

**Example:**
```
a1b2c3d John Doe 2024-01-15 10:30:00 feat(ui): add dark mode toggle
```

**Parsing Logic:**
1. Split log into lines
2. For each line:
   - Extract hash, author, date, subject using regex
   - Parse Conventional Commits format: `type(scope): subject`
   - Validate date is within filter range
   - Create structured object
3. Filter out invalid commits:
   - Merge commits
   - WIP commits
   - Commits without proper format
   - Commits without subject

**Key Patterns:**
```javascript
const typePattern = /^(feat|fix|docs|style|refactor|test|chore|perf)/i
const scopePattern = /\(([^)]+)\)/
const dateTimePattern = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/
```

### Markdown Generator (`src/app/utils/markdownGenerator.js`)

**Output Structure:**
```markdown
# Changelog

## Summary
- Total commits: X
- Features: Y
- Bug Fixes: Z

## Features
- **scope**: description ([hash](link))

## Bug Fixes
- **scope**: description ([hash](link))
```

## State Management

All state managed via React useState in `src/app/page.js`:

```javascript
// User input
const [log, setLog] = useState('')

// Processed data
const [formattedLog, setFormattedLog] = useState([])

// Filters
const [initialDate, setInitialDate] = useState()
const [endDate, setEndDate] = useState()

// Repository context
const [selectedRepo, setSelectedRepo] = useState(null)

// UI state
const [loading, setLoading] = useState(false)

// Derived state (computed)
const filteredLog = filterLog(formattedLog)
const feats = getFeatures(filteredLog)
const fixes = getFixes(filteredLog)
const source = generateMarkdown(filteredLog, feats, fixes)
```

## Component Structure

```
src/app/
├── components/
│   ├── alerts/
│   │   └── ErrorAlert.js       # Error notifications
│   ├── AuthButton.js            # OAuth login buttons
│   ├── ChangelogPreview.js      # Markdown preview
│   ├── Footer.js                # Footer component
│   ├── GitCommandDisplay.js     # Git command with copy
│   ├── LogInput.js              # Text area for log input
│   ├── Navbar.js                # Navigation header
│   ├── RepositorySelector.js    # Repo selection UI
│   ├── SessionProvider.js       # Auth session wrapper
│   ├── Toolbar.js               # Filter controls
│   └── UserMenu.js              # User profile menu
├── utils/
│   ├── gitLogParser.js          # Git log parsing logic
│   └── markdownGenerator.js     # Markdown generation
├── api/
│   ├── auth/[...nextauth]/      # Auth.js routes
│   ├── repos/                   # Repository API routes
│   └── validate/                # reCAPTCHA validation
├── constants.js                 # App constants
├── layout.js                    # Root layout
└── page.js                      # Main page component
```

## Security Considerations

### Client-Side Processing
- Git log data never leaves the browser in manual mode
- Processing happens entirely in JavaScript

### reCAPTCHA Protection
- Enabled in production to prevent abuse
- Automatically disabled in development
- Validates with score > 0.5

### OAuth Security
- Access tokens stored in encrypted JWT
- Sessions expire based on provider token lifetime
- Middleware protects authenticated routes
- No tokens exposed to client-side code

### Environment Variables
- OAuth secrets never exposed to browser
- reCAPTCHA secret only used server-side
- AUTH_SECRET used for JWT encryption

## Performance Considerations

### Bundle Size
- Chakra UI v3 with tree-shaking enabled
- Dynamic imports for heavy components could be added
- No server-side rendering for main app (client-only)

### API Rate Limits
- GitHub: 5000 requests/hour (authenticated)
- GitLab: 2000 requests/hour (authenticated)
- Bitbucket: 1000 requests/hour (authenticated)

### Optimization Opportunities
- Implement request caching for repository lists
- Add pagination for large commit histories
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

## Code Style

- **No semicolons** (enforced by Prettier)
- **Single quotes** for strings and JSX
- **Tab width**: 2 spaces
- **ESLint**: Extends Next.js core-web-vitals and Prettier configs
- **File naming**: PascalCase for components, camelCase for utilities

## Git Log Command

Standard command used by the application:

```bash
git --no-pager log --all --oneline \
  --pretty=format:"%h %an %ad %s" \
  --date=format-local:"%Y-%m-%d %H:%M:%S"
```

**Output Format:**
- `%h` - Short commit hash
- `%an` - Author name
- `%ad` - Author date
- `%s` - Commit subject

**Example Output:**
```
a1b2c3d John Doe 2024-01-15 10:30:00 feat(ui): add dark mode
b2c3d4e Jane Smith 2024-01-15 11:45:00 fix(parser): handle edge case
```

## Conventional Commits

The parser expects commits following the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>
```

**Supported Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

**Example:**
```
feat(parser): add support for multi-line commits
fix(ui): correct button alignment on mobile
docs(readme): update installation instructions
```

Commits not following this format are filtered out during processing.
