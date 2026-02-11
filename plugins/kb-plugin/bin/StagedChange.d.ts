/**
 * Data model for staged changes in the knowledge base.
 * Staged changes allow mutations to be proposed, reviewed, and then applied or rejected.
 */
import { SourceType } from './Source';
export type StagedChangeOperation = 'add-fact' | 'update-fact' | 'remove-fact' | 'add-topic' | 'update-topic' | 'remove-topic' | 'merge-topics' | 'rename-topic' | 'set-topic-persistence' | 'add-source' | 'remove-source';
export type StagingReason = 'batch' | 'persistent-topic' | 'conflict' | 'reorganization' | 'scope-mismatch' | 'sensitive-content';
export interface ConflictContext {
    existingFactId: number;
    existingFactContent: string;
    existingFactTopics: string[];
    conflictDescription: string;
}
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
export interface StagedChange {
    id: number;
    operation: StagedChangeOperation;
    params: OperationParams[StagedChangeOperation];
    description: string;
    stagingReasons: StagingReason[];
    conflicts?: ConflictContext[];
    group?: string;
}
export interface StagedChangesFile {
    stagedAt: string;
    summary: string;
    changes: StagedChange[];
}
//# sourceMappingURL=StagedChange.d.ts.map