# SangamGPT

A modern Next.js starter for a public AI workspace with AI Chat, AI Video, AI Voice, and Login/Signup screens.

## What works immediately
- Responsive SangamGPT interface.
- AI Chat through a server-side OpenAI API route (requires your own API key).
- Text-to-speech using the browser's built-in speech engine.
- Browser speech-to-text microphone input where supported.
- Login and signup UI wired to Supabase when credentials are configured.
- AI Video request route with a provider adapter placeholder.

## Important: free hosting is not the same as free AI
GitHub and Vercel can host a project on their free tiers subject to their current limits and terms. AI inference, video generation, and some voice services can cost money. This project does not include paid API credits or promise unlimited free generation.

## Run locally
1. Install Node.js 20 or newer.
2. Extract this project.
3. Open a terminal in this folder and run:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env.local`.
5. Add `OPENAI_API_KEY` to `.env.local` for AI chat.
6. Start the website:
   ```bash
   npm run dev
   ```
7. Open http://localhost:3000

Never put secret API keys in code or in variables beginning with `NEXT_PUBLIC_`.

## Enable login and signup
1. Create a project at https://supabase.com/.
2. In Supabase Authentication settings, configure your allowed site URL and redirect URLs.
3. Copy the Project URL and anon/public key into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Add the same variables to Vercel Environment Variables and redeploy.

The UI uses Supabase email/password authentication. Enable email confirmation in Supabase if desired. For production, configure rate limits, email templates, abuse prevention, and appropriate privacy terms.

## Enable AI Chat
1. Create an API key with your chosen AI provider.
2. Put it in `OPENAI_API_KEY` in `.env.local`.
3. Add `OPENAI_API_KEY` as a Vercel server-side Environment Variable.
4. Redeploy.

The sample route uses the OpenAI Chat Completions API and `gpt-4o-mini`. Model availability and pricing can change; check your provider account.

## Enable AI Video
Video generation requires a separate provider account and API. Set:
- `VIDEO_API_URL`
- `VIDEO_API_KEY`

The `/api/video` route is a generic adapter sending `{ "prompt": "..." }` as JSON with Bearer authentication. Different video providers use different request formats, asynchronous job IDs, and result polling. Edit `app/api/video/route.ts` to match your provider's documented API before expecting generated video output. Keep the key server-side.

## Deploy to Vercel
1. Create a GitHub account and a new **Public** repository.
2. Upload the extracted project files to the repository root.
3. Go to https://vercel.com/ and sign in with GitHub.
4. Select **Add New → Project**, import the SangamGPT repository, and deploy.
5. In Vercel Project Settings → Environment Variables, add the same variables from `.env.local`.
6. Redeploy after adding environment variables.

Vercel will provide a public `*.vercel.app` address. A custom domain is optional and usually costs extra.

## Publish with GitHub Pages?
This project uses Next.js server API routes for chat and video, so deploy it to Vercel or another Next.js host. GitHub Pages alone cannot run these server routes.

## Before public launch
- Add privacy policy and terms.
- Configure Supabase allowed URLs and email settings.
- Add rate limiting and abuse protection to API routes.
- Set usage limits and billing alerts with AI providers.
- Do not promise unlimited free AI video or voice.
- Review provider terms, data handling, and user consent.
