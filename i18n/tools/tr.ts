import type { ToolingSlice } from './_types.ts';
import bundle from '../bundles/tr.json' with { type: 'json' };

export const trTooling: ToolingSlice = {
	toolCategories: bundle.toolCategories,
	toolNames: bundle.toolNames,
	tools: bundle.tools,
};
