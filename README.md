# Resume Studio

Resume Studio is a production-oriented resume workspace for individuals, families, career coaches, and teams that manage more than one person or more than one version of a resume.

## What is included

- One authenticated workspace with multiple people and multiple resumes per person
- Reusable master profiles and one-click identity sync into tailored resumes
- Resume duplication for fast job-specific variants
- Live A4 preview with multi-page detection
- Twelve professional, ATS-conscious starting templates
- Live ATS analysis with content, parser-safety, keyword-match, and per-template projected scores
- Job-description comparison with matched and missing keyword guidance
- Private LinkedIn PDF/text import with an editable review step before creating a resume
- Editable colours, body and heading fonts, font sizes, line height, margins, spacing, header alignment, photo, and one/two-column layout
- Per-section naming, visibility, order, and standard/timeline/compact presentation
- AI refinement for a whole field or selected text
- Prompt-to-editable-template generation; AI returns design settings rather than locking content into an image
- PDF, DOCX, browser print, HTML, resume JSON, and full-workspace JSON export
- Responsive desktop/mobile experience
- Supabase email/password authentication, cloud persistence, and row-level security
- Google OAuth through Supabase Auth
- Branded in-app confirmation and notice dialogs instead of native browser prompts
- Local-first demo mode when Supabase is not configured

## Local development

```bash
npm run install:all
npm run dev
```

The Vite client runs on `http://localhost:5173` and the export/AI server runs on `http://localhost:4000`.

## Production configuration

1. Copy `.env.example` values into the relevant client and server deployment environments.
2. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the Vite build.
4. Create an OpenAI API key and set `OPENAI_API_KEY` only in the server/Vercel environment. Never expose it through a `VITE_` variable.
5. For Google login, create a Web OAuth client in Google Auth Platform. Add `https://<project-ref>.supabase.co/auth/v1/callback` as its authorised redirect URI, then enable Google in Supabase Auth Providers with that Client ID and secret.
6. Add `http://127.0.0.1:5173/**`, `http://localhost:5173/**`, and the exact production site URL to Supabase Auth's redirect allow list.
7. Deploy with the included `vercel.json`, or run the Express server and static Vite build on your own infrastructure.

The application works locally without Supabase or OpenAI. In that mode, resumes persist in browser storage; AI actions display a clear configuration message.

## Verification

```bash
cd client
npm run lint
npm run build

cd ../
node --check server/index.js
node --check api/ai.js
```

PDF export requires Chrome locally. The Vercel handler uses `@sparticuz/chromium`. DOCX export is generated server-side.
