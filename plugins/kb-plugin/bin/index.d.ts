export { Topic } from './Topic';
export { Fact } from './Fact';
export { Source, SourceType } from './Source';
export { KnowledgeBase, BatchApplyContext } from './KnowledgeBase';
export { KnowledgeBaseMetadata } from './KnowledgeBaseMetadata';
export type { StagedChangeOperation, StagingReason, ConflictContext, StagedChange, StagedChangesFile, OperationParams, AddFactParams, UpdateFactParams, RemoveFactParams, AddTopicParams, UpdateTopicParams, RemoveTopicParams, MergeTopicsParams, RenameTopicParams, SetTopicPersistenceParams, AddSourceParams, RemoveSourceParams, } from './StagedChange';
import { KnowledgeBase } from './KnowledgeBase';
export declare const VERSION = "1.4.0";
export declare function createKnowledgeBase(kbPath: string): KnowledgeBase;
//# sourceMappingURL=index.d.ts.map