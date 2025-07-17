# Suna Frontend

## Quick Setup

The easiest way to get your frontend configured is to use the setup wizard from the project root:

```bash
cd .. # Navigate to project root if you're in the frontend directory
python setup.py
```

This will configure all necessary environment variables automatically.

## Environment Configuration

The setup wizard automatically creates a `.env.local` file with the following configuration:

```sh
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_ENV_MODE=LOCAL
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run the production server:

```bash
npm run start
```

## Development Notes

- The frontend connects to the backend API at `http://localhost:8000/api`
- Supabase is used for authentication and database operations
- The app runs on `http://localhost:3000` by default
- Environment variables are automatically configured by the setup wizard

## Velvet AI UI & Branding Changes

- **Brand Name:** All references to "Suna" and "Kortix AI" have been replaced with "Velvet" and "Velvet AI" throughout the UI.
- **Logo & Favicon:** The Velvet logo and symbol are now used in the navbar, sidebar, footer, chat, and agent selectors. The favicon is updated to the Velvet symbol.
- **Color Palette:** A new Velvet color palette (deep purples, Velvet accent, premium shadows) is applied globally via CSS variables.
- **Component Theming:** All UI components (inputs, selects, dropdowns, tooltips, alerts, badges, buttons, cards, modals, etc.) use Velvet theme variables for backgrounds, borders, and accents.
- **Navigation:** Navigation links (Home, Use Cases, Open Source, Pricing) are updated and styled for Velvet branding.
- **Backgrounds:** Animated and static backgrounds on the homepage, auth page, and dashboard are consistent with the Velvet theme.
- **Special Pages:** Auth, error, billing, and modal dialogs use Velvet theme variables for a cohesive look.
- **UI Consistency:** Borders, gradients, and backgrounds have been refined for a modern, premium, and consistent Velvet experience.

For details on setting up and using mock data, see [MOCK_README.md](./MOCK_README.md).
