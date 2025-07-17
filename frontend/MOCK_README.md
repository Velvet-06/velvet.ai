# Mock Data Setup for Velvet Frontend

This guide explains how to use and customize mock data for developing the Velvet AI frontend without a backend.

## Enabling Mock Mode

1. In your `frontend/.env.local` file, set:
   ```
   NEXT_PUBLIC_MOCK_MODE=true
   ```
   This will intercept all backend API calls and return mock data for authentication, agents, threads, and marketplace.

2. To switch back to the real backend, set:
   ```
   NEXT_PUBLIC_MOCK_MODE=false
   ```

## Customizing Mock Data

- All mock API responses are defined in `src/lib/mock-api.ts`.
- You can edit or extend the mock data in that file to suit your development needs.

## Frontend-Only Development

- When mock mode is enabled, you can develop and test the UI without running the backend.
- All authentication, agent, thread, and marketplace features will use mock data.

## More Information

- For a step-by-step guide and advanced options, see [FRONTEND_ONLY_SETUP.md](./FRONTEND_ONLY_SETUP.md).

---

**Velvet AI** — Modern, mockable, and developer-friendly UI. 