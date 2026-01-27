// Main exports for the Claude Code Knowledge Base TypeScript library

export { Topic } from './Topic';
export { Fact, Source } from './Fact';
export { KnowledgeBase } from './KnowledgeBase';
export { KnowledgeBaseMetadata } from './KnowledgeBaseMetadata';

// Re-export types for convenience
export type { Source as SourceType } from './Fact';

// Import for internal use
import { KnowledgeBase } from './KnowledgeBase';

// Version information
export const VERSION = '1.1.0';

// Utility function to create a new knowledge base with initialization
export function createKnowledgeBase(kbPath: string): KnowledgeBase {
  KnowledgeBase.initializeKnowledgeBase(kbPath);
  return new KnowledgeBase(kbPath);
}