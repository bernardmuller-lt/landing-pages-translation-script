import { en, type Dictionary } from './en';
import { es } from './es';
import { fr } from './fr';
import { it } from './it';
import { ptBR } from './pt-BR';
import { de } from './de';
import { ja } from './ja';
import { pl } from './pl';
import { tr } from './tr';
import { ar } from './ar';
import { nl } from './nl';
import { ko } from './ko';
import {
	DEFAULT_LOCALE,
	LOCALES,
	LOCALE_CODES,
	NON_DEFAULT_LOCALES,
	getLocaleMeta,
	isRtl,
	type Locale,
} from './locales';

const DICTIONARIES: Record<Locale, Dictionary> = {
	en,
	es,
	fr,
	it,
	'pt-BR': ptBR,
	de,
	ja,
	pl,
	tr,
	ar,
	nl,
	ko,
};

export function getDictionary(lang: Locale): Dictionary {
	return DICTIONARIES[lang] ?? DICTIONARIES.en;
}

/**
 * Returns a translator function for the given locale that resolves
 * dot-notation keys such as `home.hero.title1` against the dictionary.
 * Falls back to the English value if the key is missing.
 * Supports simple `{var}` interpolation via the optional second argument.
 */
export function useTranslations(lang: Locale) {
	const dict = getDictionary(lang);
	const fallback = DICTIONARIES.en;

	return function t(key: string, vars?: Record<string, string | number>): string {
		const resolve = (source: unknown): string | undefined => {
			const parts = key.split('.');
			let cursor: unknown = source;
			for (const part of parts) {
				if (cursor && typeof cursor === 'object' && part in (cursor as Record<string, unknown>)) {
					cursor = (cursor as Record<string, unknown>)[part];
				} else {
					return undefined;
				}
			}
			return typeof cursor === 'string' ? cursor : undefined;
		};

		const raw = resolve(dict) ?? resolve(fallback) ?? key;

		if (!vars) return raw;
		return raw.replace(/\{(\w+)\}/g, (_, name) => {
			return name in vars ? String(vars[name]) : `{${name}}`;
		});
	};
}

/**
 * Builds a path prefixed with the locale segment (except for the default
 * locale, which is served at the root). `path` should begin with `/` and
 * represent the English/canonical path (e.g. `/pricing/`). The return
 * value is suitable for use as an `href` on the static site.
 */
export function localizedPath(path: string, lang: Locale): string {
	const normalized = path.startsWith('/') ? path : `/${path}`;

	if (lang === DEFAULT_LOCALE) {
		return normalized;
	}

	// Strip any existing locale prefix from the path so we can re-prefix cleanly.
	const stripped = stripLocalePrefix(normalized);
	return `/${lang}${stripped === '/' ? '/' : stripped}`;
}

/**
 * Removes any leading `/<locale>` segment if present, returning the
 * canonical path (always starting with `/`). Useful to switch languages
 * on the current page via `LanguageSwitcher`.
 */
export function stripLocalePrefix(path: string): string {
	const match = path.match(/^\/([^/]+)(\/.*)?$/);
	if (!match) return path;
	const first = match[1];
	if ((LOCALE_CODES as readonly string[]).includes(first) && first !== DEFAULT_LOCALE) {
		return match[2] ?? '/';
	}
	return path;
}

/**
 * Detects the active locale from a URL pathname. Returns the default
 * locale when no locale prefix is present.
 */
export function getLocaleFromPath(pathname: string): Locale {
	const match = pathname.match(/^\/([^/]+)(?:\/|$)/);
	if (!match) return DEFAULT_LOCALE;
	const first = match[1] as Locale;
	if ((LOCALE_CODES as readonly string[]).includes(first)) return first;
	return DEFAULT_LOCALE;
}

export { DEFAULT_LOCALE, LOCALES, LOCALE_CODES, NON_DEFAULT_LOCALES, getLocaleMeta, isRtl };
export type { Locale, Dictionary };
