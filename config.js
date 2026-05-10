// ═══════════════════════════════════════════════
//  NexERM — Configuration
//  EDIT THESE VALUES with your Supabase project
// ═══════════════════════════════════════════════

const NEXERM_CONFIG = {
  SUPABASE_URL: 'https://ohnuaawpobqidakcbzap.supabase.co/rest/v1/',
  SUPABASE_ANON_KEY: 'sb_publishable_zpubfLByJRMxFjuyrCITfA_MT2fV9PY',
  APP_NAME: 'NEX-ERM',
  APP_VERSION: '1.0.0',
  WORK_HOURS_PER_DAY: 8,
  OVERTIME_MULTIPLIER: 1.5,
  PF_PERCENT: 12,
  TAX_PERCENT: 5,
  LEAVE_DAYS_PER_YEAR: 24,
  CURRENCY_SYMBOL: '₹',
  CURRENCY_LOCALE: 'en-IN',
};

const SUPABASE_CONFIGURED =
  NEXERM_CONFIG.SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co' &&
  NEXERM_CONFIG.SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY_HERE';
