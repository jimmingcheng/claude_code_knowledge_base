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
/**
 * Main knowledge base class that manages topics and facts.
 * Loads data from JSON files and provides methods for querying and updating the knowledge base.
 */
class KnowledgeBase {
    constructor(kbPath) {
        this.kbPath = kbPath;
        this.topics = this.loadTopics(path.join(kbPath, 'topics.json'));
        this.facts = this.loadFacts(path.join(kbPath, 'facts.json'));
    }
    /**
     * Loads topics from the topics.json file.
     */
    loadTopics(topicsJsonPath) {
        try {
            const fileContent = fs.readFileSync(topicsJsonPath, 'utf-8');
            const topicsData = JSON.parse(fileContent);
            return topicsData.map(topicObj => Topic_1.Topic.fromObject(topicObj));
        }
        catch (error) {
            console.warn(`Could not load topics from ${topicsJsonPath}:`, error);
            return [];
        }
    }
    /**
     * Loads facts from the facts.json file.
     */
    loadFacts(factsJsonPath) {
        try {
            const fileContent = fs.readFileSync(factsJsonPath, 'utf-8');
            const factsData = JSON.parse(fileContent);
            return factsData.map(factObj => Fact_1.Fact.fromObject(factObj));
        }
        catch (error) {
            console.warn(`Could not load facts from ${factsJsonPath}:`, error);
            return [];
        }
    }
    /**
     * Saves topics to the topics.json file.
     */
    saveTopics() {
        // Ensure directory exists
        if (!fs.existsSync(this.kbPath)) {
            fs.mkdirSync(this.kbPath, { recursive: true });
        }
        const topicsJsonPath = path.join(this.kbPath, 'topics.json');
        const topicsData = this.topics.map(topic => topic.toObject());
        const jsonContent = JSON.stringify(topicsData, null, 2);
        fs.writeFileSync(topicsJsonPath, jsonContent, 'utf-8');
    }
    /**
     * Saves facts to the facts.json file.
     */
    saveFacts() {
        // Ensure directory exists
        if (!fs.existsSync(this.kbPath)) {
            fs.mkdirSync(this.kbPath, { recursive: true });
        }
        const factsJsonPath = path.join(this.kbPath, 'facts.json');
        const factsData = this.facts.map(fact => fact.toObject());
        const jsonContent = JSON.stringify(factsData, null, 2);
        fs.writeFileSync(factsJsonPath, jsonContent, 'utf-8');
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
    createTopic(name, description) {
        // Check if topic already exists
        const existingTopic = this.findTopicByName(name);
        if (existingTopic) {
            return existingTopic;
        }
        const topic = new Topic_1.Topic(name, description);
        this.upsertTopic(topic);
        return topic;
    }
    /**
     * Creates a new fact with an auto-generated ID.
     * Topics will be created if they don't exist.
     */
    createFact(content, topicNames, sources) {
        // Ensure all topics exist, create them if they don't
        for (const topicName of topicNames) {
            this.createTopic(topicName, `Auto-created topic: ${topicName}`);
        }
        const id = this.getNextFactId();
        const fact = new Fact_1.Fact(id, content, topicNames, sources);
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
    updateFact(id, content, topicNames, sources) {
        const existingIndex = this.facts.findIndex(f => f.id === id);
        if (existingIndex >= 0) {
            // Ensure all topics exist, create them if they don't
            for (const topicName of topicNames) {
                this.createTopic(topicName, `Auto-created topic: ${topicName}`);
            }
            const updatedFact = new Fact_1.Fact(id, content, topicNames, sources);
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
            const updatedTopic = new Topic_1.Topic(name, newDescription);
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
                this.facts[index] = new Fact_1.Fact(fact.id, fact.content, newTopics, fact.sources);
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
        // Create new topic with the new name and same description
        const newTopic = new Topic_1.Topic(newName, oldTopic.description);
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
                this.facts[index] = new Fact_1.Fact(fact.id, fact.content, newTopics, fact.sources);
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
     * Returns statistics about the knowledge base.
     */
    getStats() {
        const totalTopics = this.topics.length;
        const totalFacts = this.facts.length;
        const totalTopicReferences = this.facts.reduce((sum, fact) => sum + fact.topics.size, 0);
        const averageTopicsPerFact = totalFacts > 0 ? totalTopicReferences / totalFacts : 0;
        return {
            totalTopics,
            totalFacts,
            averageTopicsPerFact: Math.round(averageTopicsPerFact * 100) / 100, // Round to 2 decimal places
        };
    }
    /**
     * Creates the knowledge base directory and empty JSON files if they don't exist.
     */
    static initializeKnowledgeBase(kbPath) {
        // Create directory if it doesn't exist
        if (!fs.existsSync(kbPath)) {
            fs.mkdirSync(kbPath, { recursive: true });
        }
        // Create empty topics.json if it doesn't exist
        const topicsPath = path.join(kbPath, 'topics.json');
        if (!fs.existsSync(topicsPath)) {
            fs.writeFileSync(topicsPath, '[]', 'utf-8');
        }
        // Create empty facts.json if it doesn't exist
        const factsPath = path.join(kbPath, 'facts.json');
        if (!fs.existsSync(factsPath)) {
            fs.writeFileSync(factsPath, '[]', 'utf-8');
        }
    }
}
exports.KnowledgeBase = KnowledgeBase;
//# sourceMappingURL=KnowledgeBase.js.map