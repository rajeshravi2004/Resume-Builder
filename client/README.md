# Resume Builder Client

## Local Development

1. Start API server (in `server/`):

   ```bash
   npm run dev
   ```

2. Start client (in `client/`):

   ```bash
   npm run dev
   ```

## Deployment to Vercel

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed instructions on deploying to Vercel.

Quick steps:
1. Push your code to Git (GitHub, GitLab, or Bitbucket)
2. Import the project in [Vercel Dashboard](https://vercel.com/new)
3. Vercel will auto-detect settings from `vercel.json`
4. Deploy!

Builder

- Use the Builder page to edit your resume content.
- The top-right actions let you:
  - **Download JSON**: export the current resume as `resume.json`.
  - **Load JSON**: import a previously saved `resume.json`.
  - **Reset Sample**: restore the built-in sample resume.
  - **Clear All**: start from an empty resume.

Templates

- Use the Templates page to choose a layout style.
- The live thumbnails use the same data as your resume for an accurate preview.
- Switch between built-in templates or activate a fully **Custom** template from the editor.
- You can also upload your own HTML resume template and use placeholders like `{{fullName}}`, `{{email}}`, `{{#experience}}...{{/experience}}` to have it filled with your data automatically.

Preview & Export

- Use the Preview & Export page to review your resume and download PDF or DOCX.
- For PDF via Puppeteer, specify your Chrome executable path if needed (Windows example):

  C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe
