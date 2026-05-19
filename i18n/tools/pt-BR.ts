import type { ToolingSlice } from './_types.ts';
import bundle from '../bundles/pt-BR.json' with { type: 'json' };

export const ptBRTooling: ToolingSlice = {
	toolCategories: bundle.toolCategories,
	toolNames: bundle.toolNames,
	tools: bundle.tools,
};
