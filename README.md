# Maqbool Islamic Products

Faithful Next.js conversion of the supplied five-page HTML storefront.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS and shadcn/ui configuration
- Supabase Database, Authentication, and Storage
- Next.js serverless API routes and a Supabase Edge Function
- Vercel deployment configuration

## Local setup

1. Copy `.env.example` to `.env.local` and add the Supabase project values.
2. Run the SQL migration in `supabase/migrations`.
3. Install and start:

   ```bash
   npm install
   npm run dev
   ```

## Routes

- `/`
- `/shop`
- `/product`
- `/about`
- `/contact`

The contact form writes to `contact_messages`. Auth session refresh and the OAuth callback are configured, and authenticated media uploads are available at `POST /api/media`.

## Deploy

Import the GitHub repository into Vercel, add the three environment variables from `.env.example`, and deploy. Vercel detects Next.js automatically.
