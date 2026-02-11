/**
 * Data model for staged changes in the knowledge base.
 * Staged changes allow mutations to be proposed, reviewed, and then applied or rejected.
 */

import { SourceType } from './Source';

// All possible mutation operations
export type StagedChangeOperation =
  | 'add-fact'
  | 'update-fact'
  | 'remove-fact'
  | 'add-topic'
  | 'update-topic'
  | 'remove-topic'
  | 'merge-topics'
  | 'rename-topic'
  | 'set-topic-persistence'
  | 'add-source'
  | 'remove-source';

// Why a change was staged for review
export type StagingReason =
  | 'batch'
  | 'persistent-topic'
  | 'conflict'
  | 'reorganization'
  | 'scope-mismatch'
  | 'sensitive-content';

// Context for conflicts with existing facts
export interface ConflictContext {
  existingFactId: number;
  existingFactContent: string;
  existingFactTopics: string[];
  conflictDescription: string;
}

// Operation-specific parameter types
export interface AddFactParams {
  content: string;
  topics: string[];
  sourceIds: number[];
}

export interface UpdateFactParams {
  id: number;
  content: string;
  topics: string[];
  sourceIds: number[];
}

export interface RemoveFactParams {
  id: number;
}

export interface AddTopicParams {
  name: string;
  description: string;
  isPersistent: boolean;
}

export interface UpdateTopicParams {
  name: string;
  description: string;
}

export interface RemoveTopicParams {
  name: string;
}

export interface MergeTopicsParams {
  source: string;
  target: string;
}

export interface RenameTopicParams {
  oldName: string;
  newName: string;
}

export interface SetTopicPersistenceParams {
  name: string;
  isPersistent: boolean;
}

export interface AddSourceParams {
  type: SourceType;
  title: string;
  url?: string;
  refId?: number;
}

export interface RemoveSourceParams {
  id: number;
}

// Map from operation to its params type
export type OperationParams = {
  'add-fact': AddFactParams;
  'update-fact': UpdateFactParams;
  'remove-fact': RemoveFactParams;
  'add-topic': AddTopicParams;
  'update-topic': UpdateTopicParams;
  'remove-topic': RemoveTopicParams;
  'merge-topics': MergeTopicsParams;
  'rename-topic': RenameTopicParams;
  'set-topic-persistence': SetTopicPersistenceParams;
  'add-source': AddSourceParams;
  'remove-source': RemoveSourceParams;
};

// A single staged change
export interface StagedChange {
  id: number;                          // Sequential ID within this batch
  operation: StagedChangeOperation;
  params: OperationParams[StagedChangeOperation];
  description: string;                 // Human-readable explanation
  stagingReasons: StagingReason[];
  conflicts?: ConflictContext[];
  group?: string;                      // Optional grouping label
}

// The complete staged changes file
export interface StagedChangesFile {
  stagedAt: string;                    // ISO 8601 timestamp
  summary: string;                     // Why these were staged
  changes: StagedChange[];
}
