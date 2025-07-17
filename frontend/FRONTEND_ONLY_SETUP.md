# Frontend-Only Setup Guide

This guide will help you run just the Suna frontend without the backend for UI development and testing.

## Quick Start

### Option 1: Using the provided script (Recommended)

```bash
# Navigate to frontend directory
cd frontend

# Run the frontend-only startup script
node start-frontend-only.js
```

This script will:
- Create a `.env.local` file with mock environment variables
- Start the Next.js development server
- Provide mock data for all API calls

### Option 2: Manual setup

1. **Create environment file:**
   Create a file called `.env.local` in the `frontend` directory with:

```env
# Mock environment variables for frontend-only development
NEXT_PUBLIC_SUPABASE_URL=https://mock-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=mock-supabase-anon-key-for-development-only
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_ENV_MODE=MOCK
NEXT_PUBLIC_GOOGLE_CLIENT_ID=mock-google-client-id
NEXT_PUBLIC_SENTRY_DSN=https://mock-sentry-dsn@sentry.io/mock
NEXT_PUBLIC_TOLT_REFERRAL_ID=mock-tolt-id
NEXT_PUBLIC_MOCK_MODE=true
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

## What's Mocked

The frontend will work with mock data for:

- **Authentication** - Mock user session
- **Agents** - Sample agent list with different types
- **Threads** - Mock conversation threads
- **Marketplace** - Sample agent templates
- **API Calls** - All backend endpoints return mock responses

## Accessing the App

Once started, you can access the frontend at:
- **Homepage**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Agents**: http://localhost:3000/agents

## Features Available

✅ **Landing Page** - Full homepage with all sections
✅ **Dashboard** - Main dashboard interface
✅ **Agent Management** - View and manage agents
✅ **Marketplace** - Browse agent templates
✅ **Navigation** - All navigation and routing
✅ **UI Components** - All React components and styling
✅ **Responsive Design** - Mobile and desktop layouts

## Limitations

❌ **Real API Calls** - All backend calls are mocked
❌ **Authentication** - No real user login/logout
❌ **File Uploads** - File operations are simulated
❌ **Real-time Features** - No live updates
❌ **Agent Execution** - Agents cannot actually run

## Customizing Mock Data

You can modify the mock data in `src/lib/mock-api.ts` to:
- Add more sample agents
- Change user information
- Modify marketplace templates
- Add different thread examples

## Switching to Full Backend

When you're ready to connect to the real backend:

1. Remove the `.env.local` file or set `NEXT_PUBLIC_MOCK_MODE=false`
2. Set up the backend following the main README
3. Update environment variables with real values
4. Restart the development server

## Troubleshooting

**Port 3000 already in use:**
```bash
# Kill existing process
npx kill-port 3000
# Or use a different port
npm run dev -- -p 3001
```

**Module not found errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Environment variables not loading:**
- Make sure `.env.local` is in the `frontend` directory
- Restart the development server after changing environment variables 