Server usage

Run

1. Set Chrome path (recommended on Windows):

   - Create a .env file in server/ with:

   CHROME_PATH=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe

2. Start:

   npm run dev

Endpoints

- POST /export/pdf { html: string, chromePath?: string, pdfOptions?: PuppeteerPDFOptions }
- POST /export/docx { html: string }


