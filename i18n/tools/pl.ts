import type { ToolingSlice } from './_types.ts';
import bundle from '../bundles/pl.json' with { type: 'json' };

export const plTooling: ToolingSlice = {
	toolCategories: bundle.toolCategories,
	toolNames: bundle.toolNames,
	tools: bundle.tools,
};
