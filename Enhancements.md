# Future Architectural Enhancements

This document outlines potential future architectures and feature upgrades for the Portfolio Builder to increase scale, lower operational overhead, and improve the business model.

## 1. 100% Serverless Client-Side Architecture (No Backend)
Moving away from a dedicated Node/Express backend to a fully in-browser architecture hosted natively on Vercel or GitHub Pages.

**Implementation Steps:**
- Move PDF/DOCX parsing entirely to the browser using `pdfjs-dist` and `mammoth.js` client-side builds.
- Remove the `syncTemplate` disk-reading logic and instead package the React/Vite template as a static pre-compiled `.zip` or JSON blob in the `public/` directory.
- Use `Octokit` directly in the browser (authenticated via the user's Github token) to build the repository and push the blobs.

**Pros:** 
- $0 hosting cost.
- Infinite scaling with zero downtime or server sleeps.
- Removes heavy parsing load from the central server.

**Cons:** 
- **Security:** Users MUST provide their own Gemini API Key. The central API key cannot be shipped to the frontend.

## 2. Advanced Usage & Monetization (Keeping the Backend)
Continuing to use the current backend architecture to build a real SaaS platform.

**Implementation Steps:**
- **Database Integration:** Connect a database (e.g. Postgres or Supabase) to store user sessions and generated portfolios.
- **Paywalls & Quotas:** Enforce limits (e.g. "1 free generated portfolio per user") using OAuth login. Use Stripe to charge for premium template features or unlimited AI enhancements.
- **Failovers:** Implement backend logic to rotate between multiple Google API accounts to avoid the 20-request free tier limit, or dynamically fall back to OpenAI when Gemini is exhausted.

**Pros:**
- Enables monetization and a real business model.
- Conceals the API key securely.
- Offloads heavy PDF-processing from mobile devices to the server.
