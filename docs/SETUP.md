# Setup Guide

Complete setup guide for Git Reporter development environment.

## Prerequisites

- Node.js 18+ installed
- Git installed
- GitHub/GitLab/Bitbucket account (for OAuth)

## 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

**Note:** The `--legacy-peer-deps` flag is required due to `next-recaptcha-v3` peer dependency constraints with Next.js 16.

## 2. Environment Setup

Create a `.env` file:

```bash
cp .env.example .env
```

## 3. Generate AUTH_SECRET

Generate a secure secret for JWT signing:

```bash
openssl rand -base64 32
```

Add it to `.env`:

```env
AUTH_SECRET=your-generated-secret-here
```

## 4. Configure OAuth Providers

You need at least ONE OAuth provider (GitHub is recommended for quickstart).

### Option A: Quick Start with GitHub Only

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Name**: `Git Reporter Local`
   - **Homepage URL**: `http://localhost:3000`
   - **Callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate a Client Secret
5. Add to `.env`:

```env
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

**Required Scopes:**
- `read:user` - Read user profile information
- `user:email` - Access user email
- `repo` - Access to repositories (for fetching commits)

### Option B: Full Setup (All Providers)

#### GitHub OAuth App

Follow Option A above.

#### GitLab OAuth App

1. Go to [GitLab Applications](https://gitlab.com/-/profile/applications)
2. Fill in:
   - **Name**: `Git Reporter`
   - **Redirect URI**: `http://localhost:3000/api/auth/callback/gitlab`
   - **Scopes**: Select `read_user`, `read_api`, `read_repository`
3. Click "Save application"
4. Copy Application ID and Secret
5. Add to `.env`:

```env
GITLAB_CLIENT_ID=your-application-id
GITLAB_CLIENT_SECRET=your-secret
```

**Required Scopes:**
- `read_user` - Read user information
- `read_api` - API access
- `read_repository` - Read repositories

#### Bitbucket OAuth App

1. Go to your Bitbucket workspace
2. Navigate to Settings > OAuth consumers
3. Click "Add consumer"
4. Fill in:
   - **Name**: `Git Reporter`
   - **Callback URL**: `http://localhost:3000/api/auth/callback/bitbucket`
   - **Permissions**: Select:
     - Account: Read
     - Repositories: Read
5. Click "Save"
6. Copy Key and Secret
7. Add to `.env`:

```env
BITBUCKET_CLIENT_ID=your-key
BITBUCKET_CLIENT_SECRET=your-secret
```

**Required Scopes:**
- `account` - Read account information
- `repository` - Access to repositories

## 5. Configure reCAPTCHA (Optional)

If you want to enable bot protection:

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Register a new site with reCAPTCHA v3
3. Add the keys to `.env`:

```env
NEXT_PUBLIC_RECAPTCHA_API_KEY=your-site-key
RECAPTCHA_SECRET_API_KEY=your-secret-key
```

**Note:** reCAPTCHA validation is automatically skipped in development mode.

## 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 7. Test Authentication

1. Click on the login button for your configured provider
2. Authorize the application
3. You should see your name and avatar in the header
4. Try selecting a repository to analyze

## Complete .env Example

```env
# Authentication
AUTH_SECRET=your-generated-secret

# GitHub (Required)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# GitLab (Optional)
GITLAB_CLIENT_ID=your-gitlab-client-id
GITLAB_CLIENT_SECRET=your-gitlab-client-secret

# Bitbucket (Optional)
BITBUCKET_CLIENT_ID=your-bitbucket-client-id
BITBUCKET_CLIENT_SECRET=your-bitbucket-client-secret

# reCAPTCHA (Optional)
NEXT_PUBLIC_RECAPTCHA_API_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_API_KEY=your-recaptcha-secret
```

## Production Deployment

When deploying to production:

1. Update OAuth callback URLs in all providers:
   - GitHub: `https://yourdomain.com/api/auth/callback/github`
   - GitLab: `https://yourdomain.com/api/auth/callback/gitlab`
   - Bitbucket: `https://yourdomain.com/api/auth/callback/bitbucket`

2. Set all environment variables in your hosting platform

3. Ensure `AUTH_SECRET` is different from development

4. Enable reCAPTCHA for production (validation is enforced)

## Troubleshooting

### "Missing AUTH_SECRET"
→ Generate and add AUTH_SECRET to .env

### "Callback URL mismatch"
→ Verify callback URL in OAuth app matches exactly:
- Development: `http://localhost:3000/api/auth/callback/{provider}`
- Production: `https://yourdomain.com/api/auth/callback/{provider}`

### "Invalid client_id or client_secret"
→ Verify values copied correctly to .env without extra spaces
→ Restart dev server after changing .env

### "Session not persisting"
→ Verify AUTH_SECRET is set correctly
→ Use HTTPS in production

### "Failed to fetch repositories/commits"
→ Verify OAuth scopes include repository access
→ Check access token is being stored in session
→ Verify user has access to the requested resources

### npm install fails
→ Use `npm install --legacy-peer-deps` flag

### Changes to .env not working
→ Restart development server (Ctrl+C then `npm run dev`)
