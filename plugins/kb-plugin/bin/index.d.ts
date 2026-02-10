export { Topic } from './Topic';
export { Fact, Source } from './Fact';
export { KnowledgeBase } from './KnowledgeBase';
export { KnowledgeBaseMetadata } from './KnowledgeBaseMetadata';
export type { StagedChangeOperation, StagingReason, ConflictContext, StagedChange, StagedChangesFile, OperationParams, AddFactParams, UpdateFactParams, RemoveFactParams, AddTopicParams, UpdateTopicParams, RemoveTopicParams, MergeTopicsParams, RenameTopicParams, SetTopicPersistenceParams, SaveLinkParams, } from './StagedChange';
export type { Source as SourceType } from './Fact';
import { KnowledgeBase } from './KnowledgeBase';
export declare const VERSION = "1.4.0";
export declare function createKnowledgeBase(kbPath: string): KnowledgeBase;
//# sourceMappingURL=index.d.ts.map