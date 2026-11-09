// Cookie helpers. Cookies are scoped to the app's folder (e.g. /food-tracker-app/ on GitHub Pages),
// SameSite=Lax, and Secure when served over HTTPS.

const PATH = (() => {
  const p = window.location.pathname;
  return p.endsWith('/') ? p : p.slice(0, p.lastIndexOf('/') + 1) || '/';
})();
const SECURE = window.location.protocol === 'https:' ? '; Secure' : '';

export const COOKIE = {
  session: 'zalak_session',
  consent: 'zalak_consent',
  prefs: 'zalak_prefs',
};

export function getCookie(name) {
  const hit = document.cookie.split('; ').find((c) => c.startsWith(name + '='));
  if (!hit) return null;
  try { return decodeURIComponent(hit.slice(name.length + 1)); } catch { return null; }
}

// days = null → session cookie (cleared when the browser closes)
export function setCookie(name, value, days = 365) {
  const age = days == null ? '' : `; Max-Age=${Math.round(days * 86400)}`;
  document.cookie = `${name}=${encodeURIComponent(value)}${age}; Path=${PATH}; SameSite=Lax${SECURE}`;
}

export function removeCookie(name) {
  document.cookie = `${name}=; Max-Age=0; Path=${PATH}; SameSite=Lax${SECURE}`;
}

export function getJSONCookie(name) {
  const v = getCookie(name);
  if (!v) return null;
  try { return JSON.parse(v); } catch { return null; }
}

// What each cookie does — shown in the cookie settings panel.
export const COOKIE_LIST = [
  { name: COOKIE.session, group: 'necessary', life: { en: '30 days, or until the browser closes', mk: '30 дена, или додека не се затвори прелистувачот' } },
  { name: COOKIE.consent, group: 'necessary', life: { en: '1 year', mk: '1 година' } },
  { name: COOKIE.prefs, group: 'preferences', life: { en: '1 year', mk: '1 година' } },
];
