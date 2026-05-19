import type { ToolRecord } from '../types/tool';
import { getDictionary } from './index';
import type { Locale } from './locales';

type ToolCategoryKey =
	| 'security'
	| 'splitMerge'
	| 'editPdf'
	| 'convertFromPdf'
	| 'convertToPdf'
	| 'compress';

type ToolNameId = keyof ReturnType<typeof getDictionary>['toolNames'];

type ToolBase = {
	id: ToolNameId;
	categoryKey: ToolCategoryKey;
	icon: string;
};

export const TOOLS_BASE: ToolBase[] = [
	{ id: 'sign-pdf', categoryKey: 'security', icon: 'FileSignature' },
	{ id: 'password-protect', categoryKey: 'security', icon: 'Lock' },
	{ id: 'share-pdf', categoryKey: 'security', icon: 'Share2' },
	{ id: 'share-files', categoryKey: 'security', icon: 'FolderOpen' },
	{ id: 'split-pdf', categoryKey: 'splitMerge', icon: 'Scissors' },
	{ id: 'merge-pdf', categoryKey: 'splitMerge', icon: 'Combine' },
	{ id: 'combine-pdf', categoryKey: 'splitMerge', icon: 'LayoutGrid' },
	{ id: 'reorder-pdf', categoryKey: 'splitMerge', icon: 'ArrowUpDown' },
	{ id: 'extract-pages', categoryKey: 'splitMerge', icon: 'FileStack' },
	{ id: 'edit-pdf', categoryKey: 'editPdf', icon: 'Edit3' },
	{ id: 'edit-fill-pdf', categoryKey: 'editPdf', icon: 'FilePen' },
	{ id: 'edit-scanned-pdf', categoryKey: 'editPdf', icon: 'ScanLine' },
	{ id: 'add-image-to-pdf', categoryKey: 'editPdf', icon: 'ImagePlus' },
	{ id: 'watermark', categoryKey: 'editPdf', icon: 'Droplet' },
	{ id: 'rotate-pdf', categoryKey: 'editPdf', icon: 'RotateCw' },
	{ id: 'delete-pages', categoryKey: 'editPdf', icon: 'Trash2' },
	{ id: 'pages-numbering', categoryKey: 'editPdf', icon: 'Hash' },
	{ id: 'pdf-reader', categoryKey: 'editPdf', icon: 'FileText' },
	{ id: 'pdf-to-word', categoryKey: 'convertFromPdf', icon: 'FileOutput' },
	{ id: 'pdf-to-jpg', categoryKey: 'convertFromPdf', icon: 'FileImage' },
	{ id: 'pdf-to-png', categoryKey: 'convertFromPdf', icon: 'FileImage' },
	{ id: 'pdf-to-powerpoint', categoryKey: 'convertFromPdf', icon: 'Presentation' },
	{ id: 'pdf-to-excel', categoryKey: 'convertFromPdf', icon: 'FileSpreadsheet' },
	{ id: 'pdf-to-pdfa', categoryKey: 'convertFromPdf', icon: 'Archive' },
	{ id: 'word-to-pdf', categoryKey: 'convertToPdf', icon: 'FileInput' },
	{ id: 'jpg-to-pdf', categoryKey: 'convertToPdf', icon: 'FileInput' },
	{ id: 'png-to-pdf', categoryKey: 'convertToPdf', icon: 'FileInput' },
	{ id: 'powerpoint-to-pdf', categoryKey: 'convertToPdf', icon: 'FileInput' },
	{ id: 'excel-to-pdf', categoryKey: 'convertToPdf', icon: 'FileInput' },
	{ id: 'pdfa-to-pdf', categoryKey: 'convertToPdf', icon: 'FileInput' },
	{ id: 'compress-pdf', categoryKey: 'compress', icon: 'Minimize2' },
	{ id: 'compress-image', categoryKey: 'compress', icon: 'Minimize2' },
];

function interpolate(template: string, vars: Record<string, string>): string {
	return template.replace(/\{(\w+)\}/g, (_, key) => (key in vars ? vars[key] : `{${key}}`));
}

export function getToolsForLocale(lang: Locale): ToolRecord[] {
	const dict = getDictionary(lang);
	return TOOLS_BASE.map((tool) => {
		const name = dict.toolNames[tool.id];
		const vars = { name, nameLower: name.toLowerCase() };
		const { templates } = dict.tools;
		return {
			id: tool.id,
			name,
			category: dict.toolCategories[tool.categoryKey],
			icon: tool.icon,
			tagline: interpolate(templates.tagline, vars),
			description: interpolate(templates.description, vars),
			features: [
				{
					title: templates.features.fast.title,
					description: interpolate(templates.features.fast.description, vars),
				},
				{
					title: templates.features.quality.title,
					description: templates.features.quality.description,
				},
				{
					title: templates.features.secure.title,
					description: templates.features.secure.description,
				},
				{
					title: templates.features.app.title,
					description: templates.features.app.description,
				},
			],
			howItWorks: [
				{
					step: 1,
					title: templates.howItWorks.upload.title,
					description: interpolate(templates.howItWorks.upload.description, vars),
				},
				{
					step: 2,
					title: templates.howItWorks.choose.title,
					description: templates.howItWorks.choose.description,
				},
				{
					step: 3,
					title: templates.howItWorks.process.title,
					description: templates.howItWorks.process.description,
				},
				{
					step: 4,
					title: templates.howItWorks.download.title,
					description: templates.howItWorks.download.description,
				},
			],
			faqs: [
				{
					question: interpolate(templates.faqs.free.question, vars),
					answer: templates.faqs.free.answer,
				},
				{
					question: templates.faqs.where.question,
					answer: templates.faqs.where.answer,
				},
			],
		};
	});
}

export function getToolIds(): string[] {
	return TOOLS_BASE.map((t) => t.id);
}
