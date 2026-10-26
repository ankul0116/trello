# Trello Frontend (React 18 + Vite + TypeScript + Tailwind CSS)

Modern, agile project management and Kanban workspace client.

## Technologies Used
- **React 18 & Vite**: Fast development and optimized bundling
- **TypeScript**: Full static typing and strict null checks
- **Tailwind CSS v4 & Lucide Icons**: Modern dark-mode UI with glassmorphism
- **React Router DOM v7**: Client-side routing with protected routes
- **Axios**: HTTP client with automatic JWT token injection
- **Button-based status controls**: Move issues between Kanban columns

## Project Structure
```
src/
├── types/api.ts          # Strongly-typed API models & DTOs
├── services/             # Axios API service layer (auth, org, board, issue)
├── context/AuthContext   # Global auth state & session handling
├── components/
│   ├── auth/             # ProtectedRoute guard
│   ├── layout/           # Navbar & Sidebar components
│   └── ui/               # Button, Input, Modal, Badge
└── pages/
    ├── LoginPage.tsx     # Sign in page
    ├── RegisterPage.tsx  # Sign up page with auto-login
    ├── DashboardPage.tsx # Workspaces & boards dashboard
    └── BoardPage.tsx     # 3-column interactive Kanban board
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```
