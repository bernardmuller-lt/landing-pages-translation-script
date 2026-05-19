import type { ToolingSlice } from './_types.ts';
import bundle from '../bundles/en.json' with { type: 'json' };

export const enTooling: ToolingSlice = {
	toolCategories: bundle.toolCategories,
	toolNames: bundle.toolNames,
	tools: bundle.tools,
};
