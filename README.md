# Dental Loyalty App 🦷

A modern web application for managing dental clinic loyalty programs built with Vite, React, TypeScript, Tailwind CSS, and Supabase.

## Features

### For Administrators
- **Client Management**: Create, edit, and delete client profiles
- **Points Management**: Adjust client points with reasons for audit trail
- **Spending Tracking**: Record client purchases and automatically award points
- **Dashboard**: Overview of total clients, points, and spending
- **Search & Filter**: Find clients quickly by name or phone number

### For Clients
- **View Points**: Check current loyalty points balance
- **Spending History**: See total amount spent at the clinic
- **Profile Management**: Update phone number
- **Secure Access**: Magic link/OTP authentication

### Technical Features
- **Role-based Authentication**: Admin (email/password) and Client (magic link) access
- **Real-time Updates**: Powered by TanStack Query with automatic refetching
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Type Safety**: Full TypeScript support with proper type definitions
- **Toast Notifications**: User-friendly feedback for all actions
- **Route Protection**: Authentication guards for secure access

## Tech Stack

- **Frontend**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Backend**: Supabase (Auth, Database, Real-time)
- **Database**: PostgreSQL with Row Level Security
- **Icons**: Lucide React

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd vouchere-clinica
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API and copy your project URL and anon key
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Database

1. Go to your Supabase dashboard > SQL Editor
2. Run the SQL script from `database/schema.sql`
3. This will create all necessary tables, policies, and sample data

### 4. Create Admin User

1. In Supabase Auth, create a new user with email/password
2. Copy the user ID from the Users table
3. Run this SQL to make them an admin:
```sql
INSERT INTO profiles (id, role) VALUES ('USER_ID_HERE', 'admin');
```

### 5. Run the Application

```bash
npm run dev
```

Visit `http://localhost:5173` and log in!

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui base components
│   ├── AuthGuard.tsx   # Route protection component
│   ├── ClientForm.tsx  # Client creation/editing form
│   ├── PointsAdjustment.tsx  # Points adjustment modal
│   └── SpendingForm.tsx      # Spending record form
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── lib/                # Utility functions
│   └── utils.ts        # Tailwind class merger
├── pages/              # Page components
│   ├── LoginPage.tsx   # Login/authentication page
│   ├── AdminPage.tsx   # Admin dashboard
│   └── ClientPage.tsx  # Client dashboard
├── supabase/           # Supabase integration
│   ├── client.ts       # Supabase client setup
│   └── api.ts          # API functions
├── types/              # TypeScript type definitions
│   └── index.ts        # App-wide types
├── App.tsx             # Main app component with routing
└── main.tsx           # App entry point
```

## Authentication Flow

### Admin Login
- Email and password authentication
- Direct access to admin dashboard
- Full CRUD operations on all clients

### Client Login  
- Magic link sent to email
- OTP-based authentication
- Access only to personal dashboard
- Can update phone number only

## Database Schema

### Tables
- `profiles` - Extends auth.users with role and client_id
- `clients` - Client information (name, phone, points, totalSpent)
- `points_adjustments` - Audit trail for point changes
- `spending_records` - Audit trail for purchases

### Security
- Row Level Security (RLS) enabled on all tables
- Admins can access all data
- Clients can only access their own data
- Clients can only update their phone number

## Key Features Implementation

### Points System
- 1 point earned per $1 spent
- Administrators can manually adjust points
- All changes are logged with reasons

### Real-time Updates
- TanStack Query provides optimistic updates
- Automatic refetching on window focus
- Error handling with toast notifications

### Responsive Design
- Mobile-first approach
- Cards and tables adapt to screen size
- Touch-friendly interface elements

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details
