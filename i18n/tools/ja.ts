import type { ToolingSlice } from './_types.ts';
import bundle from '../bundles/ja.json' with { type: 'json' };

export const jaTooling: ToolingSlice = {
	toolCategories: bundle.toolCategories,
	toolNames: bundle.toolNames,
	tools: bundle.tools,
};
