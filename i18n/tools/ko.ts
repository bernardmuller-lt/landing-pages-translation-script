import type { ToolingSlice } from './_types.ts';
import bundle from '../bundles/ko.json' with { type: 'json' };

export const koTooling: ToolingSlice = {
	toolCategories: bundle.toolCategories,
	toolNames: bundle.toolNames,
	tools: bundle.tools,
};
