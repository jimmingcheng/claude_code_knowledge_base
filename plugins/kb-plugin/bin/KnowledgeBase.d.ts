import { Topic } from './Topic';
import { Fact } from './Fact';
import { Source } from './Source';
import { KnowledgeBaseMetadata } from './KnowledgeBaseMetadata';
import { StagedChange, StagedChangesFile } from './StagedChange';
/**
 * Context passed through a batch of staged change applications,
 * allowing add-source refIds to be resolved to real IDs by subsequent add-fact operations.
 */
export interface BatchApplyContext {
    sourceIdMap: Map<number, number>;
}
/**
 * Main knowledge base class that manages topics, facts, and sources.
 * Loads data from JSON files and provides methods for querying and updating the knowledge base.
 */
export declare class KnowledgeBase {
    private readonly kbPath;
    private topics;
    private facts;
    private sources;
    private metadata;
    constructor(kbPath: string);
    /**
     * Loads topics from the topics.json file.
     */
    private loadTopics;
    /**
     * Loads facts from the facts.json file.
     */
    private loadFacts;
    /**
     * Loads sources from the sources.json file.
     */
    private loadSources;
    /**
     * Migrates old-format facts (sources: string[]) to new format (sourceIds: number[]).
     * Runs once after loading if old-format data is detected.
     */
    private migrateOldSourcesIfNeeded;
    /**
     * Loads metadata from the kb.json file.
     */
    private loadMetadata;
    /**
     * Saves topics to the topics.json file.
     */
    private saveTopics;
    /**
     * Saves facts to the facts.json file.
     */
    private saveFacts;
    /**
     * Saves sources to the sources.json file.
     */
    private saveSources;
    /**
     * Saves metadata to the kb.json file.
     */
    private saveMetadata;
    /**
     * Returns all topics in the knowledge base.
     */
    getAllTopics(): Topic[];
    /**
     * Returns all facts in the knowledge base.
     */
    getAllFacts(): Fact[];
    /**
     * Returns all sources in the knowledge base.
     */
    getAllSources(): Source[];
    /**
     * Returns the knowledge base metadata.
     */
    getMetadata(): KnowledgeBaseMetadata | null;
    /**
     * Checks if the knowledge base has metadata (kb.json exists and is loaded).
     */
    hasMetadata(): boolean;
    /**
     * Sets the knowledge base metadata and saves it to kb.json.
     */
    setMetadata(name: string, description: string): KnowledgeBaseMetadata;
    /**
     * Returns facts that have any of the specified topics.
     */
    getFactsByTopics(topics: Topic[]): Fact[];
    /**
     * Returns facts that have any of the specified topic names.
     */
    getFactsByTopicNames(topicNames: string[]): Fact[];
    /**
     * Returns facts that have all of the specified topics.
     */
    getFactsByAllTopics(topics: Topic[]): Fact[];
    /**
     * Returns facts that have all of the specified topic names.
     */
    getFactsByAllTopicNames(topicNames: string[]): Fact[];
    /**
     * Finds a topic by its name.
     */
    findTopicByName(name: string): Topic | undefined;
    /**
     * Returns Topic objects for the given topic names.
     */
    getTopicsByNames(topicNames: string[]): Topic[];
    /**
     * Returns Topic objects for a fact's topic names.
     */
    getTopicsForFact(fact: Fact): Topic[];
    /**
     * Finds a fact by its ID.
     */
    findFactById(id: number): Fact | undefined;
    /**
     * Searches facts by content (case-insensitive substring match).
     */
    searchFactsByContent(query: string): Fact[];
    /**
     * Finds a source by its ID.
     */
    findSourceById(id: number): Source | undefined;
    /**
     * Finds a source by URL (for deduplication of url-type sources).
     */
    findSourceByUrl(url: string): Source | undefined;
    /**
     * Finds the maximum source ID currently in use.
     */
    private getMaxSourceId;
    /**
     * Generates the next available source ID.
     */
    getNextSourceId(): number;
    /**
     * Creates a new source. For url-type sources, deduplicates by URL.
     */
    createSource(type: 'person' | 'url', title: string, url?: string, addedAt?: string): Source;
    /**
     * Removes a source by ID.
     */
    removeSourceById(id: number): boolean;
    /**
     * Finds the maximum fact ID currently in use.
     */
    private getMaxFactId;
    /**
     * Generates the next available fact ID.
     */
    getNextFactId(): number;
    /**
     * Creates a new topic. If a topic with the same name already exists, returns the existing one.
     */
    createTopic(name: string, description: string, isPersistent?: boolean): Topic;
    /**
     * Creates a new fact with an auto-generated ID.
     * Topics will be created if they don't exist (as non-persistent auto-created topics).
     */
    createFact(content: string, topicNames: Set<string>, sourceIds: Set<number>): Fact;
    /**
     * Inserts a new topic or updates an existing one (by name).
     */
    upsertTopic(topic: Topic): void;
    /**
     * Inserts a new fact or updates an existing one (by ID).
     */
    upsertFact(fact: Fact): void;
    /**
     * Removes a topic from the knowledge base.
     * Note: This does not remove the topic from facts that reference it.
     */
    removeTopic(topic: Topic): boolean;
    /**
     * Removes a topic by name from the knowledge base.
     */
    removeTopicByName(name: string): boolean;
    /**
     * Removes a fact from the knowledge base.
     */
    removeFact(fact: Fact): boolean;
    /**
     * Removes a fact by its ID.
     */
    removeFactById(id: number): boolean;
    /**
     * Updates an existing fact by ID. Returns the updated fact or null if not found.
     */
    updateFact(id: number, content: string, topicNames: Set<string>, sourceIds: Set<number>): Fact | null;
    /**
     * Updates an existing topic's description. Returns the updated topic or null if not found.
     */
    updateTopic(name: string, newDescription: string): Topic | null;
    /**
     * Merges a source topic into a target topic, updating all facts that reference the source topic.
     * Returns true if successful, false if source or target topic doesn't exist.
     */
    mergeTopics(sourceTopicName: string, targetTopicName: string): boolean;
    /**
     * Renames a topic, updating all facts that reference it.
     * Returns true if successful, false if the old topic doesn't exist or new name already exists.
     */
    renameTopic(oldName: string, newName: string): boolean;
    /**
     * Changes the persistence status of a topic.
     * Returns true if successful, false if topic doesn't exist.
     */
    setTopicPersistence(topicName: string, isPersistent: boolean): boolean;
    /**
     * Returns the path to the staged-changes.json file.
     */
    getStagedChangesPath(): string;
    /**
     * Loads staged changes from disk. Returns null if no staged changes file exists.
     */
    loadStagedChanges(): StagedChangesFile | null;
    /**
     * Writes staged changes to disk.
     */
    saveStagedChanges(staged: StagedChangesFile): void;
    /**
     * Deletes the staged changes file. Returns true if the file existed and was deleted.
     */
    clearStagedChanges(): boolean;
    /**
     * Applies a single staged change by dispatching to the appropriate CRUD method.
     * Returns a human-readable result message.
     * Optionally accepts a BatchApplyContext for refId -> actualId mapping.
     */
    applyStagedChange(change: StagedChange, context?: BatchApplyContext): string;
    /**
     * Returns statistics about the knowledge base.
     */
    getStats(): {
        totalTopics: number;
        totalFacts: number;
        totalSources: number;
        averageTopicsPerFact: number;
    };
    /**
     * Creates the knowledge base directory.
     * Does NOT create topics.json or facts.json - those require kb.json to exist first.
     */
    static initializeKnowledgeBase(kbPath: string): void;
    /**
     * Creates topics.json, facts.json, and sources.json if they don't exist.
     * REQUIRES kb.json to exist first.
     */
    private ensureDataFilesExist;
    /**
     * Creates CLAUDE.md protection file to prevent direct JSON modification by other agents.
     */
    private ensureClaudeProtectionFile;
    /**
     * Returns embedded CLAUDE.md template as fallback.
     */
    private getEmbeddedClaudeTemplate;
}
//# sourceMappingURL=KnowledgeBase.d.ts.map