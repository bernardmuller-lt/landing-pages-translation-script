import type { ToolingSlice } from './_types.ts';
import bundle from '../bundles/ar.json' with { type: 'json' };

export const arTooling: ToolingSlice = {
	toolCategories: bundle.toolCategories,
	toolNames: bundle.toolNames,
	tools: bundle.tools,
};
