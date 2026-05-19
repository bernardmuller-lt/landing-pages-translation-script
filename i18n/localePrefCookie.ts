import type { Locale } from './locales';

export const LOCALE_PREF_COOKIE = 'l';

const MAX_AGE_SEC = 31536000;

export function setLocalePrefCookie(locale: Locale | string): void {
	if (typeof document === 'undefined') return;
	document.cookie = `${LOCALE_PREF_COOKIE}=${encodeURIComponent(String(locale))};Path=/;Max-Age=${MAX_AGE_SEC};SameSite=Lax`;
}
