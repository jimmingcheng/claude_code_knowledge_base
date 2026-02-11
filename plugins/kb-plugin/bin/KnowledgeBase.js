"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeBase = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Topic_1 = require("./Topic");
const Fact_1 = require("./Fact");
const Source_1 = require("./Source");
const KnowledgeBaseMetadata_1 = require("./KnowledgeBaseMetadata");
/**
 * Main knowledge base class that manages topics, facts, and sources.
 * Loads data from JSON files and provides methods for querying and updating the knowledge base.
 */
class KnowledgeBase {
    constructor(kbPath) {
        this.kbPath = kbPath;
        this.metadata = this.loadMetadata(path.join(kbPath, 'kb.json'));
        this.topics = this.loadTopics(path.join(kbPath, 'topics.json'));
        this.sources = this.loadSources(path.join(kbPath, 'sources.json'));
        // Load facts with migration support
        const factsJsonPath = path.join(kbPath, 'facts.json');
        this.facts = this.loadFacts(factsJsonPath);
        this.migrateOldSourcesIfNeeded(factsJsonPath);
    }
    /**
     * Loads topics from the topics.json file.
     */
    loadTopics(topicsJsonPath) {
        if (!fs.existsSync(topicsJsonPath)) {
            return []; // Silent when file doesn't exist - this is expected
        }
        try {
            const fileContent = fs.readFileSync(topicsJsonPath, 'utf-8');
            const topicsData = JSON.parse(fileContent);
            return topicsData.map(topicObj => Topic_1.Topic.fromObject(topicObj));
        }
        catch (error) {
            console.warn(`Could not parse topics from ${topicsJsonPath}:`, error);
            return [];
        }
    }
    /**
     * Loads facts from the facts.json file.
     */
    loadFacts(factsJsonPath) {
        if (!fs.existsSync(factsJsonPath)) {
            return []; // Silent when file doesn't exist - this is expected
        }
        try {
            const fileContent = fs.readFileSync(factsJsonPath, 'utf-8');
            const factsData = JSON.parse(fileContent);
            return factsData.map(factObj => Fact_1.Fact.fromObject(factObj));
        }
        catch (error) {
            console.warn(`Could not parse facts from ${factsJsonPath}:`, error);
            return [];
        }
    }
    /**
     * Loads sources from the sources.json file.
     */
    loadSources(sourcesJsonPath) {
        if (!fs.existsSync(sourcesJsonPath)) {
            return [];
        }
        try {
            const fileContent = fs.readFileSync(sourcesJsonPath, 'utf-8');
            const sourcesData = JSON.parse(fileContent);
            return sourcesData.map(sourceObj => Source_1.Source.fromObject(sourceObj));
        }
        catch (error) {
            console.warn(`Could not parse sources from ${sourcesJsonPath}:`, error);
            return [];
        }
    }
    /**
     * Migrates old-format facts (sources: string[]) to new format (sourceIds: number[]).
     * Runs once after loading if old-format data is detected.
     */
    migrateOldSourcesIfNeeded(factsJsonPath) {
        if (!fs.existsSync(factsJsonPath)) {
            return;
        }
        try {
            const fileContent = fs.readFileSync(factsJsonPath, 'utf-8');
            const factsData = JSON.parse(fileContent);
            // Check if any fact has old-format "sources" field (string array) instead of "sourceIds"
            const needsMigration = factsData.some((f) => Array.isArray(f.sources) && f.sources.length > 0 && typeof f.sources[0] === 'string' && f.sourceIds === undefined);
            if (!needsMigration) {
                return;
            }
            // Migrate each fact's string sources to Source entities
            let migrated = false;
            for (let i = 0; i < factsData.length; i++) {
                const rawFact = factsData[i];
                if (Array.isArray(rawFact.sources) && rawFact.sourceIds === undefined) {
                    const newSourceIds = [];
                    for (const sourceStr of rawFact.sources) {
                        if (typeof sourceStr !== 'string')
                            continue;
                        const isUrl = sourceStr.startsWith('http://') || sourceStr.startsWith('https://');
                        let source;
                        if (isUrl) {
                            // Check for existing source with same URL
                            const existing = this.findSourceByUrl(sourceStr);
                            if (existing) {
                                source = existing;
                            }
                            else {
                                source = this.createSource('url', sourceStr, sourceStr);
                            }
                        }
                        else {
                            // Person-type source
                            const existing = this.sources.find(s => s.type === 'person' && s.title === sourceStr);
                            if (existing) {
                                source = existing;
                            }
                            else {
                                source = this.createSource('person', sourceStr);
                            }
                        }
                        newSourceIds.push(source.id);
                    }
                    // Update the in-memory fact
                    this.facts[i] = new Fact_1.Fact(this.facts[i].id, this.facts[i].content, this.facts[i].topics, new Set(newSourceIds), this.facts[i].addedAt);
                    migrated = true;
                }
            }
            if (migrated) {
                this.saveFacts();
                this.saveSources();
            }
        }
        catch (error) {
            console.warn('Could not migrate old sources format:', error);
        }
    }
    /**
     * Loads metadata from the kb.json file.
     */
    loadMetadata(metadataJsonPath) {
        if (!fs.existsSync(metadataJsonPath)) {
            return null; // Silent when file doesn't exist - this is expected
        }
        try {
            const fileContent = fs.readFileSync(metadataJsonPath, 'utf-8');
            const metadataData = JSON.parse(fileContent);
            return KnowledgeBaseMetadata_1.KnowledgeBaseMetadata.fromObject(metadataData);
        }
        catch (error) {
            console.warn(`Could not parse metadata from ${metadataJsonPath}:`, error);
            return null;
        }
    }
    /**
     * Saves topics to the topics.json file.
     */
    saveTopics() {
        // Ensure kb.json exists and data files are created
        this.ensureDataFilesExist();
        const topicsJsonPath = path.join(this.kbPath, 'topics.json');
        const topicsData = this.topics.map(topic => topic.toObject());
        const jsonContent = JSON.stringify(topicsData, null, 2);
        fs.writeFileSync(topicsJsonPath, jsonContent, 'utf-8');
    }
    /**
     * Saves facts to the facts.json file.
     */
    saveFacts() {
        // Ensure kb.json exists and data files are created
        this.ensureDataFilesExist();
        const factsJsonPath = path.join(this.kbPath, 'facts.json');
        const factsData = this.facts.map(fact => fact.toObject());
        const jsonContent = JSON.stringify(factsData, null, 2);
        fs.writeFileSync(factsJsonPath, jsonContent, 'utf-8');
    }
    /**
     * Saves sources to the sources.json file.
     */
    saveSources() {
        this.ensureDataFilesExist();
        const sourcesJsonPath = path.join(this.kbPath, 'sources.json');
        const sourcesData = this.sources.map(source => source.toObject());
        const jsonContent = JSON.stringify(sourcesData, null, 2);
        fs.writeFileSync(sourcesJsonPath, jsonContent, 'utf-8');
    }
    /**
     * Saves metadata to the kb.json file.
     */
    saveMetadata() {
        if (!this.metadata) {
            return; // Don't save if no metadata exists
        }
        // Ensure directory exists
        if (!fs.existsSync(this.kbPath)) {
            fs.mkdirSync(this.kbPath, { recursive: true });
        }
        const metadataJsonPath = path.join(this.kbPath, 'kb.json');
        const metadataData = this.metadata.toObject();
        const jsonContent = JSON.stringify(metadataData, null, 2);
        fs.writeFileSync(metadataJsonPath, jsonContent, 'utf-8');
        // Create CLAUDE.md protection file if it doesn't exist
        this.ensureClaudeProtectionFile();
    }
    /**
     * Returns all topics in the knowledge base.
     */
    getAllTopics() {
        return [...this.topics]; // Return a copy to prevent external modification
    }
    /**
     * Returns all facts in the knowledge base.
     */
    getAllFacts() {
        return [...this.facts]; // Return a copy to prevent external modification
    }
    /**
     * Returns all sources in the knowledge base.
     */
    getAllSources() {
        return [...this.sources];
    }
    /**
     * Returns the knowledge base metadata.
     */
    getMetadata() {
        return this.metadata;
    }
    /**
     * Checks if the knowledge base has metadata (kb.json exists and is loaded).
     */
    hasMetadata() {
        return this.metadata !== null;
    }
    /**
     * Sets the knowledge base metadata and saves it to kb.json.
     */
    setMetadata(name, description) {
        this.metadata = new KnowledgeBaseMetadata_1.KnowledgeBaseMetadata(name, description);
        this.saveMetadata();
        return this.metadata;
    }
    /**
     * Returns facts that have any of the specified topics.
     */
    getFactsByTopics(topics) {
        if (topics.length === 0) {
            return [];
        }
        return this.facts.filter(fact => fact.hasAnyTopic(topics));
    }
    /**
     * Returns facts that have any of the specified topic names.
     */
    getFactsByTopicNames(topicNames) {
        if (topicNames.length === 0) {
            return [];
        }
        return this.facts.filter(fact => fact.hasAnyTopicName(topicNames));
    }
    /**
     * Returns facts that have all of the specified topics.
     */
    getFactsByAllTopics(topics) {
        if (topics.length === 0) {
            return [...this.facts];
        }
        return this.facts.filter(fact => fact.hasAllTopics(topics));
    }
    /**
     * Returns facts that have all of the specified topic names.
     */
    getFactsByAllTopicNames(topicNames) {
        if (topicNames.length === 0) {
            return [...this.facts];
        }
        return this.facts.filter(fact => fact.hasAllTopicNames(topicNames));
    }
    /**
     * Finds a topic by its name.
     */
    findTopicByName(name) {
        return this.topics.find(topic => topic.name === name);
    }
    /**
     * Returns Topic objects for the given topic names.
     */
    getTopicsByNames(topicNames) {
        return topicNames
            .map(name => this.findTopicByName(name))
            .filter((topic) => topic !== undefined);
    }
    /**
     * Returns Topic objects for a fact's topic names.
     */
    getTopicsForFact(fact) {
        return this.getTopicsByNames(fact.getTopicNames());
    }
    /**
     * Finds a fact by its ID.
     */
    findFactById(id) {
        return this.facts.find(fact => fact.id === id);
    }
    /**
     * Searches facts by content (case-insensitive substring match).
     */
    searchFactsByContent(query) {
        const lowerQuery = query.toLowerCase();
        return this.facts.filter(fact => fact.content.toLowerCase().includes(lowerQuery));
    }
    // --- Source methods ---
    /**
     * Finds a source by its ID.
     */
    findSourceById(id) {
        return this.sources.find(source => source.id === id);
    }
    /**
     * Finds a source by URL (for deduplication of url-type sources).
     */
    findSourceByUrl(url) {
        return this.sources.find(source => source.matchesUrl(url));
    }
    /**
     * Finds the maximum source ID currently in use.
     */
    getMaxSourceId() {
        if (this.sources.length === 0) {
            return 0;
        }
        const numericIds = this.sources
            .map(source => source.id)
            .filter(id => typeof id === 'number' && !isNaN(id));
        if (numericIds.length === 0) {
            return 0;
        }
        return Math.max(...numericIds);
    }
    /**
     * Generates the next available source ID.
     */
    getNextSourceId() {
        return this.getMaxSourceId() + 1;
    }
    /**
     * Creates a new source. For url-type sources, deduplicates by URL.
     */
    createSource(type, title, url, addedAt) {
        // Deduplicate url-type by URL
        if (type === 'url' && url) {
            const existing = this.findSourceByUrl(url);
            if (existing) {
                return existing;
            }
        }
        const id = this.getNextSourceId();
        const source = new Source_1.Source(id, type, title, url, addedAt);
        this.sources.push(source);
        this.saveSources();
        return source;
    }
    /**
     * Removes a source by ID.
     */
    removeSourceById(id) {
        const initialLength = this.sources.length;
        this.sources = this.sources.filter(s => s.id !== id);
        if (this.sources.length < initialLength) {
            this.saveSources();
            return true;
        }
        return false;
    }
    /**
     * Finds the maximum fact ID currently in use.
     */
    getMaxFactId() {
        if (this.facts.length === 0) {
            return 0;
        }
        const numericIds = this.facts
            .map(fact => fact.id)
            .filter(id => typeof id === 'number' && !isNaN(id));
        if (numericIds.length === 0) {
            return 0;
        }
        return Math.max(...numericIds);
    }
    /**
     * Generates the next available fact ID.
     */
    getNextFactId() {
        return this.getMaxFactId() + 1;
    }
    /**
     * Creates a new topic. If a topic with the same name already exists, returns the existing one.
     */
    createTopic(name, description, isPersistent = false) {
        // Check if topic already exists
        const existingTopic = this.findTopicByName(name);
        if (existingTopic) {
            return existingTopic;
        }
        const topic = new Topic_1.Topic(name, description, isPersistent);
        this.upsertTopic(topic);
        return topic;
    }
    /**
     * Creates a new fact with an auto-generated ID.
     * Topics will be created if they don't exist (as non-persistent auto-created topics).
     */
    createFact(content, topicNames, sourceIds) {
        // Ensure all topics exist, create them if they don't (as non-persistent auto-created topics)
        for (const topicName of topicNames) {
            this.createTopic(topicName, `Information about ${topicName}`, false);
        }
        const id = this.getNextFactId();
        const fact = new Fact_1.Fact(id, content, topicNames, sourceIds);
        this.upsertFact(fact);
        return fact;
    }
    /**
     * Inserts a new topic or updates an existing one (by name).
     */
    upsertTopic(topic) {
        const existingIndex = this.topics.findIndex(t => t.name === topic.name);
        if (existingIndex >= 0) {
            this.topics[existingIndex] = topic;
        }
        else {
            this.topics.push(topic);
        }
        this.saveTopics();
    }
    /**
     * Inserts a new fact or updates an existing one (by ID).
     */
    upsertFact(fact) {
        const existingIndex = this.facts.findIndex(f => f.id === fact.id);
        if (existingIndex >= 0) {
            this.facts[existingIndex] = fact;
        }
        else {
            this.facts.push(fact);
        }
        this.saveFacts();
    }
    /**
     * Removes a topic from the knowledge base.
     * Note: This does not remove the topic from facts that reference it.
     */
    removeTopic(topic) {
        const initialLength = this.topics.length;
        this.topics = this.topics.filter(t => !t.equals(topic));
        if (this.topics.length < initialLength) {
            this.saveTopics();
            return true;
        }
        return false;
    }
    /**
     * Removes a topic by name from the knowledge base.
     */
    removeTopicByName(name) {
        const topic = this.findTopicByName(name);
        if (topic) {
            return this.removeTopic(topic);
        }
        return false;
    }
    /**
     * Removes a fact from the knowledge base.
     */
    removeFact(fact) {
        const initialLength = this.facts.length;
        this.facts = this.facts.filter(f => !f.equals(fact));
        if (this.facts.length < initialLength) {
            this.saveFacts();
            return true;
        }
        return false;
    }
    /**
     * Removes a fact by its ID.
     */
    removeFactById(id) {
        const fact = this.findFactById(id);
        if (fact) {
            return this.removeFact(fact);
        }
        return false;
    }
    /**
     * Updates an existing fact by ID. Returns the updated fact or null if not found.
     */
    updateFact(id, content, topicNames, sourceIds) {
        const existingIndex = this.facts.findIndex(f => f.id === id);
        if (existingIndex >= 0) {
            // Ensure all topics exist, create them if they don't (as non-persistent auto-created topics)
            for (const topicName of topicNames) {
                this.createTopic(topicName, `Information about ${topicName}`, false);
            }
            const existingFact = this.facts[existingIndex];
            const updatedFact = new Fact_1.Fact(id, content, topicNames, sourceIds, existingFact.addedAt);
            this.facts[existingIndex] = updatedFact;
            this.saveFacts();
            return updatedFact;
        }
        return null;
    }
    /**
     * Updates an existing topic's description. Returns the updated topic or null if not found.
     */
    updateTopic(name, newDescription) {
        const existingIndex = this.topics.findIndex(t => t.name === name);
        if (existingIndex >= 0) {
            const existingTopic = this.topics[existingIndex];
            // Preserve the isPersistent value and addedAt from the existing topic
            const updatedTopic = new Topic_1.Topic(name, newDescription, existingTopic.isPersistent, existingTopic.addedAt);
            this.topics[existingIndex] = updatedTopic;
            this.saveTopics();
            return updatedTopic;
        }
        return null;
    }
    /**
     * Merges a source topic into a target topic, updating all facts that reference the source topic.
     * Returns true if successful, false if source or target topic doesn't exist.
     */
    mergeTopics(sourceTopicName, targetTopicName) {
        const sourceTopic = this.findTopicByName(sourceTopicName);
        const targetTopic = this.findTopicByName(targetTopicName);
        if (!sourceTopic || !targetTopic) {
            return false;
        }
        // Update all facts that reference the source topic
        let factsUpdated = 0;
        this.facts.forEach((fact, index) => {
            if (fact.hasTopicName(sourceTopicName)) {
                // Create new topic set replacing source with target
                const newTopics = new Set();
                for (const topicName of fact.topics) {
                    if (topicName === sourceTopicName) {
                        newTopics.add(targetTopicName);
                    }
                    else {
                        newTopics.add(topicName);
                    }
                }
                // Update the fact with new topics
                this.facts[index] = new Fact_1.Fact(fact.id, fact.content, newTopics, fact.sourceIds, fact.addedAt);
                factsUpdated++;
            }
        });
        // Remove the source topic
        this.removeTopicByName(sourceTopicName);
        // Save changes
        if (factsUpdated > 0) {
            this.saveFacts();
        }
        return true;
    }
    /**
     * Renames a topic, updating all facts that reference it.
     * Returns true if successful, false if the old topic doesn't exist or new name already exists.
     */
    renameTopic(oldName, newName) {
        const oldTopic = this.findTopicByName(oldName);
        const existingNewTopic = this.findTopicByName(newName);
        if (!oldTopic || existingNewTopic) {
            return false;
        }
        // Create new topic with the new name, same description, and preserve isPersistent value and addedAt
        const newTopic = new Topic_1.Topic(newName, oldTopic.description, oldTopic.isPersistent, oldTopic.addedAt);
        this.upsertTopic(newTopic);
        // Update all facts that reference the old topic
        let factsUpdated = 0;
        this.facts.forEach((fact, index) => {
            if (fact.hasTopicName(oldName)) {
                // Create new topic set replacing old name with new name
                const newTopics = new Set();
                for (const topicName of fact.topics) {
                    if (topicName === oldName) {
                        newTopics.add(newName);
                    }
                    else {
                        newTopics.add(topicName);
                    }
                }
                // Update the fact with new topics
                this.facts[index] = new Fact_1.Fact(fact.id, fact.content, newTopics, fact.sourceIds, fact.addedAt);
                factsUpdated++;
            }
        });
        // Remove the old topic
        this.removeTopicByName(oldName);
        // Save changes
        if (factsUpdated > 0) {
            this.saveFacts();
        }
        return true;
    }
    /**
     * Changes the persistence status of a topic.
     * Returns true if successful, false if topic doesn't exist.
     */
    setTopicPersistence(topicName, isPersistent) {
        const existingIndex = this.topics.findIndex(t => t.name === topicName);
        if (existingIndex >= 0) {
            const existingTopic = this.topics[existingIndex];
            // Create new topic with updated persistence status, preserving other properties
            const updatedTopic = new Topic_1.Topic(existingTopic.name, existingTopic.description, isPersistent, existingTopic.addedAt);
            this.topics[existingIndex] = updatedTopic;
            this.saveTopics();
            return true;
        }
        return false;
    }
    // --- Staged Changes Methods ---
    /**
     * Returns the path to the staged-changes.json file.
     */
    getStagedChangesPath() {
        return path.join(this.kbPath, 'staged-changes.json');
    }
    /**
     * Loads staged changes from disk. Returns null if no staged changes file exists.
     */
    loadStagedChanges() {
        const filePath = this.getStagedChangesPath();
        if (!fs.existsSync(filePath)) {
            return null;
        }
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
            console.warn('Could not parse staged-changes.json:', error);
            return null;
        }
    }
    /**
     * Writes staged changes to disk.
     */
    saveStagedChanges(staged) {
        const filePath = this.getStagedChangesPath();
        fs.writeFileSync(filePath, JSON.stringify(staged, null, 2), 'utf-8');
    }
    /**
     * Deletes the staged changes file. Returns true if the file existed and was deleted.
     */
    clearStagedChanges() {
        const filePath = this.getStagedChangesPath();
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    }
    /**
     * Applies a single staged change by dispatching to the appropriate CRUD method.
     * Returns a human-readable result message.
     * Optionally accepts a BatchApplyContext for refId -> actualId mapping.
     */
    applyStagedChange(change, context) {
        const params = change.params;
        switch (change.operation) {
            case 'add-fact': {
                // Translate sourceIds through context.sourceIdMap if available
                let sourceIds = params.sourceIds || [];
                if (context) {
                    sourceIds = sourceIds.map(id => context.sourceIdMap.get(id) ?? id);
                }
                const fact = this.createFact(params.content, new Set(params.topics || []), new Set(sourceIds));
                return `Added fact #${fact.id}: "${params.content.substring(0, 60)}..."`;
            }
            case 'update-fact': {
                // Translate sourceIds through context.sourceIdMap if available
                let sourceIds = params.sourceIds || [];
                if (context) {
                    sourceIds = sourceIds.map(id => context.sourceIdMap.get(id) ?? id);
                }
                const updated = this.updateFact(params.id, params.content, new Set(params.topics || []), new Set(sourceIds));
                if (updated) {
                    return `Updated fact #${params.id}`;
                }
                return `ERROR: Fact #${params.id} not found`;
            }
            case 'remove-fact': {
                const removed = this.removeFactById(params.id);
                if (removed) {
                    return `Removed fact #${params.id}`;
                }
                return `ERROR: Fact #${params.id} not found`;
            }
            case 'add-topic': {
                const topic = this.createTopic(params.name, params.description || '', params.isPersistent ?? false);
                return `Added topic "${topic.name}"${topic.isPersistent ? ' [persistent]' : ''}`;
            }
            case 'update-topic': {
                const updated = this.updateTopic(params.name, params.description);
                if (updated) {
                    return `Updated topic "${params.name}"`;
                }
                return `ERROR: Topic "${params.name}" not found`;
            }
            case 'remove-topic': {
                const removed = this.removeTopicByName(params.name);
                if (removed) {
                    return `Removed topic "${params.name}"`;
                }
                return `ERROR: Topic "${params.name}" not found`;
            }
            case 'merge-topics': {
                const merged = this.mergeTopics(params.source, params.target);
                if (merged) {
                    return `Merged topic "${params.source}" into "${params.target}"`;
                }
                return `ERROR: Could not merge "${params.source}" into "${params.target}"`;
            }
            case 'rename-topic': {
                const renamed = this.renameTopic(params.oldName, params.newName);
                if (renamed) {
                    return `Renamed topic "${params.oldName}" to "${params.newName}"`;
                }
                return `ERROR: Could not rename "${params.oldName}" to "${params.newName}"`;
            }
            case 'set-topic-persistence': {
                const success = this.setTopicPersistence(params.name, params.isPersistent);
                if (success) {
                    const status = params.isPersistent ? 'persistent' : 'non-persistent';
                    return `Set topic "${params.name}" to ${status}`;
                }
                return `ERROR: Topic "${params.name}" not found`;
            }
            case 'add-source': {
                const source = this.createSource(params.type, params.title, params.url);
                // If refId is set and context is provided, store the mapping
                if (params.refId !== undefined && context) {
                    context.sourceIdMap.set(params.refId, source.id);
                }
                return `Added source #${source.id}: "${source.title}" (${source.type})`;
            }
            case 'remove-source': {
                const removed = this.removeSourceById(params.id);
                if (removed) {
                    return `Removed source #${params.id}`;
                }
                return `ERROR: Source #${params.id} not found`;
            }
            default:
                return `ERROR: Unknown operation "${change.operation}"`;
        }
    }
    /**
     * Returns statistics about the knowledge base.
     */
    getStats() {
        const totalTopics = this.topics.length;
        const totalFacts = this.facts.length;
        const totalSources = this.sources.length;
        const totalTopicReferences = this.facts.reduce((sum, fact) => sum + fact.topics.size, 0);
        const averageTopicsPerFact = totalFacts > 0 ? totalTopicReferences / totalFacts : 0;
        return {
            totalTopics,
            totalFacts,
            totalSources,
            averageTopicsPerFact: Math.round(averageTopicsPerFact * 100) / 100, // Round to 2 decimal places
        };
    }
    /**
     * Creates the knowledge base directory.
     * Does NOT create topics.json or facts.json - those require kb.json to exist first.
     */
    static initializeKnowledgeBase(kbPath) {
        // Create directory if it doesn't exist
        if (!fs.existsSync(kbPath)) {
            fs.mkdirSync(kbPath, { recursive: true });
        }
        // No longer automatically creates topics.json or facts.json
        // They will be created by ensureDataFilesExist() when needed
    }
    /**
     * Creates topics.json, facts.json, and sources.json if they don't exist.
     * REQUIRES kb.json to exist first.
     */
    ensureDataFilesExist() {
        // Check if kb.json exists before creating data files
        const kbJsonPath = path.join(this.kbPath, 'kb.json');
        if (!fs.existsSync(kbJsonPath)) {
            throw new Error('Knowledge base metadata (kb.json) must be created first. ' +
                'Use "claude-kb set-metadata <name> <description>" to initialize the knowledge base metadata before adding topics or facts.');
        }
        // Create empty topics.json if it doesn't exist
        const topicsPath = path.join(this.kbPath, 'topics.json');
        if (!fs.existsSync(topicsPath)) {
            fs.writeFileSync(topicsPath, '[]', 'utf-8');
        }
        // Create empty facts.json if it doesn't exist
        const factsPath = path.join(this.kbPath, 'facts.json');
        if (!fs.existsSync(factsPath)) {
            fs.writeFileSync(factsPath, '[]', 'utf-8');
        }
        // Create empty sources.json if it doesn't exist
        const sourcesPath = path.join(this.kbPath, 'sources.json');
        if (!fs.existsSync(sourcesPath)) {
            fs.writeFileSync(sourcesPath, '[]', 'utf-8');
        }
        // Create CLAUDE.md protection file
        this.ensureClaudeProtectionFile();
    }
    /**
     * Creates CLAUDE.md protection file to prevent direct JSON modification by other agents.
     */
    ensureClaudeProtectionFile() {
        const claudePath = path.join(this.kbPath, 'CLAUDE.md');
        // Only create if it doesn't exist (don't overwrite existing customizations)
        if (!fs.existsSync(claudePath)) {
            try {
                // Try to read the template from the src/templates directory
                const templatePath = path.join(__dirname, 'templates', 'CLAUDE.md');
                let claudeContent;
                if (fs.existsSync(templatePath)) {
                    claudeContent = fs.readFileSync(templatePath, 'utf-8');
                }
                else {
                    // Fallback: embedded template if template file not found
                    claudeContent = this.getEmbeddedClaudeTemplate();
                }
                fs.writeFileSync(claudePath, claudeContent, 'utf-8');
            }
            catch (error) {
                // If template creation fails, create a minimal protection file
                const minimalContent = `# Knowledge Base Directory - Secure Access Required

⚠️ **DO NOT MODIFY FILES DIRECTLY**

This directory contains a structured knowledge base. Direct modification of JSON files can cause data corruption.

**For operations**: Use \`kb-agent\` (Claude invokes automatically)
**Direct invocation**: Use \`claude-code task kb-agent "<request>"\`

Direct file editing bypasses input validation and semantic understanding.`;
                fs.writeFileSync(claudePath, minimalContent, 'utf-8');
            }
        }
    }
    /**
     * Returns embedded CLAUDE.md template as fallback.
     */
    getEmbeddedClaudeTemplate() {
        return `# Knowledge Base Directory - Secure Access Required

🔒 **IMPORTANT SECURITY NOTICE**: This directory contains a structured knowledge base that requires secure access protocols.

## ⚠️ DO NOT MODIFY FILES DIRECTLY

**Never directly edit these JSON files:**
- \`kb.json\` - Knowledge base metadata
- \`topics.json\` - Topic definitions and persistence settings
- \`facts.json\` - Fact content and topic associations
- \`sources.json\` - Source definitions and metadata

Direct modification bypasses critical input validation and can cause:
- Malformed topic names (entire content blocks as topic IDs)
- Data corruption and inconsistencies
- Security vulnerabilities
- Loss of semantic understanding

## ✅ Proper Access Methods

### For Knowledge Base Operations

All operations go through the intelligent \`kb-agent\`:

**Ask questions naturally** - Claude invokes kb-agent automatically:
- "What do we know about authentication?"
- "List all topics"
- "Show me facts about React"

**Direct invocation**:
\`\`\`bash
claude-code task kb-agent "what did we decide about authentication?"
claude-code task kb-agent "remember that we use PostgreSQL"
\`\`\`

### For Content Modifications
**All mutations must go through kb-agent** for intelligent validation:

\`\`\`bash
# Add new knowledge with semantic topic extraction
claude-code task kb-agent "remember that we use TypeScript for type safety"

# Create organized topic structures
claude-code task kb-agent "create a topic for authentication decisions"

# Organize and clean up knowledge base
claude-code task kb-agent "organize topics better and fix any inconsistencies"
\`\`\`

## 🛡️ Security Architecture

This knowledge base uses a **hybrid tool-based security model** with input validation and semantic understanding.

**This directory is protected by intelligent agents. Respect the security model.**`;
    }
}
exports.KnowledgeBase = KnowledgeBase;
//# sourceMappingURL=KnowledgeBase.js.map