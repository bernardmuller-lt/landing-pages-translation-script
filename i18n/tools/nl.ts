import type { ToolingSlice } from './_types.ts';
import bundle from '../bundles/nl.json' with { type: 'json' };

export const nlTooling: ToolingSlice = {
	toolCategories: bundle.toolCategories,
	toolNames: bundle.toolNames,
	tools: bundle.tools,
};
