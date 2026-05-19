import type { ToolingSlice } from './_types.ts';
import bundle from '../bundles/it.json' with { type: 'json' };

export const itTooling: ToolingSlice = {
	toolCategories: bundle.toolCategories,
	toolNames: bundle.toolNames,
	tools: bundle.tools,
};
