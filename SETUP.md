# Setup Instructions

## Prerequisites
- Node.js 18+ and npm
- Supabase account

## Environment Setup

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `database/schema.sql`
4. This will create all tables, policies, and sample data

## Creating Admin User

1. In Supabase Auth section, create a new user with email/password
2. Note the user ID from the Users table
3. Run this SQL in the SQL Editor:
   ```sql
   INSERT INTO profiles (id, role) VALUES ('YOUR_USER_ID_HERE', 'admin');
   ```

## Running the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to access the application.

## Test Accounts

After running the schema, you'll have sample clients:
- John Doe (555-0101) - 150 points, $750 spent
- Jane Smith (555-0102) - 89 points, $445.50 spent  
- Bob Johnson (555-0103) - 220 points, $1100 spent

You can create client accounts by using the magic link login with any email address.