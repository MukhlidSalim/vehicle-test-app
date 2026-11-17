// src/config/submitConfig.ts
// Settings for automatic report submission (website -> Power Automate -> SharePoint).
// Values come from Vite environment variables (.env.local locally, Vercel Environment Variables online):
//   VITE_SUBMIT_ENDPOINT = full HTTP URL of the Power Automate flow
//   VITE_SUBMIT_KEY      = secret key (must equal the key in the flow's Condition)
//   VITE_SUBMIT_ENV      = TEST
// If any value is missing, the Submit button is hidden and the site behaves exactly as before.

const env: Record<string, string | undefined> = ((import.meta as any).env || {}) as any;

export const SUBMIT_CONFIG = {
  endpoint: (env.VITE_SUBMIT_ENDPOINT || '').trim(),
  key: (env.VITE_SUBMIT_KEY || '').trim(),
  environment: ((env.VITE_SUBMIT_ENV || 'TEST').trim().toUpperCase() === 'PROD' ? 'PROD' : 'TEST') as 'TEST' | 'PROD',
  timeoutMs: 90_000,           // 90 seconds (slow mobile networks)
  maxBytes: 15 * 1024 * 1024,  // 15 MB hard limit for the PDF
};

// For now the feature is enabled ONLY for the TEST site.
export const isSubmitEnabled = (): boolean =>
  Boolean(SUBMIT_CONFIG.endpoint && SUBMIT_CONFIG.key && SUBMIT_CONFIG.environment === 'TEST');
