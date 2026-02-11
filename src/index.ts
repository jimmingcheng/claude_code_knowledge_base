// Main exports for the Claude Code Knowledge Base TypeScript library

export { Topic } from './Topic';
export { Fact } from './Fact';
export { Source, SourceType } from './Source';
export { KnowledgeBase, BatchApplyContext } from './KnowledgeBase';
export { KnowledgeBaseMetadata } from './KnowledgeBaseMetadata';

// Staged changes types
export type {
  StagedChangeOperation,
  StagingReason,
  ConflictContext,
  StagedChange,
  StagedChangesFile,
  OperationParams,
  AddFactParams,
  UpdateFactParams,
  RemoveFactParams,
  AddTopicParams,
  UpdateTopicParams,
  RemoveTopicParams,
  MergeTopicsParams,
  RenameTopicParams,
  SetTopicPersistenceParams,
  AddSourceParams,
  RemoveSourceParams,
} from './StagedChange';

// Import for internal use
import { KnowledgeBase } from './KnowledgeBase';

// Version information
export const VERSION = '1.4.0';

// Utility function to create a new knowledge base with initialization
export function createKnowledgeBase(kbPath: string): KnowledgeBase {
  KnowledgeBase.initializeKnowledgeBase(kbPath);
  return new KnowledgeBase(kbPath);
}
