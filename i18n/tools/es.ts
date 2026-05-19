import type { ToolingSlice } from './_types.ts';
import bundle from '../bundles/es.json' with { type: 'json' };

export const esTooling: ToolingSlice = {
	toolCategories: bundle.toolCategories,
	toolNames: bundle.toolNames,
	tools: bundle.tools,
};
