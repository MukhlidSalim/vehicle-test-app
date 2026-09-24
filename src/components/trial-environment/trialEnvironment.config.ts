/**
 * Trial Environment Configuration
 * 
 * Central configuration for the trial/development version of VIS.
 * To disable the trial layer entirely, set `enabled: false`.
 * To remove it permanently, delete the `trial-environment/` folder
 * and revert the two integration points in App.tsx and TopBar.tsx.
 */
export const TRIAL_ENVIRONMENT = {
  /** Master switch — set to false to hide all trial UI */
  enabled: true,

  /** The one and only official production URL */
  originalUrl: "https://vi-system.vercel.app/",

  /** sessionStorage key used to track whether the notice was already shown */
  sessionKey: "vis_trial_notice_shown",
} as const;
