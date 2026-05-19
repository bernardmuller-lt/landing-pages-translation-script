import type { ToolingSlice } from './_types.ts';
import bundle from '../bundles/fr.json' with { type: 'json' };

export const frTooling: ToolingSlice = {
	toolCategories: bundle.toolCategories,
	toolNames: bundle.toolNames,
	tools: bundle.tools,
};
