export const LOCALES = [
	{ code: 'en', label: 'English', nativeLabel: 'English', htmlLang: 'en-US', dir: 'ltr' },
	{ code: 'es', label: 'Spanish', nativeLabel: 'Español', htmlLang: 'es-ES', dir: 'ltr' },
	{ code: 'fr', label: 'French', nativeLabel: 'Français', htmlLang: 'fr-FR', dir: 'ltr' },
	{ code: 'it', label: 'Italian', nativeLabel: 'Italiano', htmlLang: 'it-IT', dir: 'ltr' },
	{ code: 'pt-BR', label: 'Portuguese (Brazil)', nativeLabel: 'Português', htmlLang: 'pt-BR', dir: 'ltr' },
	{ code: 'de', label: 'German', nativeLabel: 'Deutsch', htmlLang: 'de-DE', dir: 'ltr' },
	{ code: 'ja', label: 'Japanese', nativeLabel: '日本語', htmlLang: 'ja-JP', dir: 'ltr' },
	{ code: 'pl', label: 'Polish', nativeLabel: 'Polski', htmlLang: 'pl-PL', dir: 'ltr' },
	{ code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe', htmlLang: 'tr-TR', dir: 'ltr' },
	{ code: 'ar', label: 'Arabic', nativeLabel: 'العربية', htmlLang: 'ar', dir: 'rtl' },
	{ code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands', htmlLang: 'nl-NL', dir: 'ltr' },
	{ code: 'ko', label: 'Korean', nativeLabel: '한국어', htmlLang: 'ko-KR', dir: 'ltr' },
] as const;

export type Locale = (typeof LOCALES)[number]['code'];

export const DEFAULT_LOCALE: Locale = 'en';

export const NON_DEFAULT_LOCALES: Locale[] = LOCALES.filter((l) => l.code !== DEFAULT_LOCALE).map(
	(l) => l.code,
);

export const LOCALE_CODES: Locale[] = LOCALES.map((l) => l.code);

export function getLocaleMeta(lang: Locale) {
	const match = LOCALES.find((l) => l.code === lang);
	if (!match) {
		throw new Error(`Unknown locale: ${lang}`);
	}
	return match;
}

export function isRtl(lang: Locale): boolean {
	return getLocaleMeta(lang).dir === 'rtl';
}
