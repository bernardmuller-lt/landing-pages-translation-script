import type { ToolingSlice } from './_types.ts';
import bundle from '../bundles/de.json' with { type: 'json' };

export const deTooling: ToolingSlice = {
	toolCategories: bundle.toolCategories,
	toolNames: bundle.toolNames,
	tools: bundle.tools,
};
