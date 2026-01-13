# Homie Frontend

NextJS frontend for the Homie personal finance application.

## Tech Stack

- **NextJS 15** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **TanStack Query (React Query)** for data fetching
- **Axios** for HTTP client
- **date-fns** for date formatting
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm, yarn, or pnpm

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── _components/       # Shared components
│   ├── Button.tsx
│   └── Navigation.tsx
├── _lib/
│   ├── api/          # API client and hooks
│   │   ├── client.ts
│   │   ├── owners.ts
│   │   └── accounts.ts
│   ├── types/        # TypeScript types
│   └── utils/        # Utility functions
├── owners/           # Owners page
├── accounts/         # Accounts page
├── transactions/     # Transactions page (placeholder)
├── categories/       # Categories page (placeholder)
├── layout.tsx        # Root layout
├── page.tsx          # Home page
├── providers.tsx     # React Query provider
└── globals.css       # Global styles
```

## Features

### Implemented

- ✅ Owners management (CRUD)
- ✅ Accounts management (CRUD + close account)
- ✅ Dark mode support
- ✅ Responsive design
- ✅ React Query for data fetching and caching
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling

### To Do

- [ ] Transactions management
- [ ] Categories/Subcategories management
- [ ] Dashboard with real stats
- [ ] Transaction filters and search
- [ ] Date range picker
- [ ] Charts and visualizations
- [ ] Export functionality

## API Integration

The frontend uses TanStack Query (React Query) for server state management. All API calls are defined in `app/_lib/api/` with corresponding hooks.

Example:
```typescript
import { useOwners, useCreateOwner } from "@/app/_lib/api/owners";

// In component
const { data: owners, isLoading } = useOwners();
const createOwner = useCreateOwner();

// Create owner
await createOwner.mutateAsync({ name: "John", color: "#3B82F6", isActive: true });
```

## Building for Production

```bash
npm run build
npm run start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com)
