"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fact = void 0;
/**
 * Represents a fact in the knowledge base system.
 * Facts contain content, are categorized by topics, and reference sources by ID.
 */
class Fact {
    constructor(id, content, topics, sourceIds, addedAt) {
        this.id = id;
        this.content = content;
        this.topics = new Set(topics); // Create a copy to ensure immutability
        this.sourceIds = new Set(sourceIds); // Create a copy to ensure immutability
        this.addedAt = addedAt ?? new Date().toISOString().split('T')[0];
    }
    /**
     * Creates a Fact instance from a plain object (e.g., from JSON data).
     * Handles backward compatibility: reads old `sources: string[]` field as empty sourceIds.
     * Migration of old string sources to Source entities happens in KnowledgeBase.
     */
    static fromObject(obj) {
        const topics = new Set(obj.topics);
        // Use sourceIds if present; if old-format sources field, leave empty (migration in KnowledgeBase)
        const sourceIds = new Set(obj.sourceIds ?? []);
        return new Fact(obj.id, obj.content, topics, sourceIds, obj.addedAt);
    }
    /**
     * Converts the Fact instance to a plain object for serialization.
     */
    toObject() {
        return {
            id: this.id,
            content: this.content,
            topics: Array.from(this.topics),
            sourceIds: Array.from(this.sourceIds),
            addedAt: this.addedAt,
        };
    }
    /**
     * Checks if this fact has a specific topic (by Topic object).
     */
    hasTopic(topic) {
        return this.topics.has(topic.name);
    }
    /**
     * Checks if this fact has a specific topic (by topic name).
     */
    hasTopicName(topicName) {
        return this.topics.has(topicName);
    }
    /**
     * Checks if this fact has any of the given topics (by Topic objects).
     */
    hasAnyTopic(topics) {
        return topics.some(topic => this.hasTopic(topic));
    }
    /**
     * Checks if this fact has any of the given topic names.
     */
    hasAnyTopicName(topicNames) {
        return topicNames.some(topicName => this.hasTopicName(topicName));
    }
    /**
     * Checks if this fact has all of the given topics (by Topic objects).
     */
    hasAllTopics(topics) {
        return topics.every(topic => this.hasTopic(topic));
    }
    /**
     * Checks if this fact has all of the given topic names.
     */
    hasAllTopicNames(topicNames) {
        return topicNames.every(topicName => this.hasTopicName(topicName));
    }
    /**
     * Returns all topic names as an array.
     */
    getTopicNames() {
        return Array.from(this.topics);
    }
    /**
     * Checks if this fact has a specific source by ID.
     */
    hasSourceId(id) {
        return this.sourceIds.has(id);
    }
    /**
     * Returns a string representation of the fact.
     */
    toString() {
        const topicList = Array.from(this.topics).join(', ');
        return `Fact(id=${this.id}, topics=[${topicList}], content="${this.content.substring(0, 50)}...")`;
    }
    /**
     * Checks if this fact is equal to another fact (by ID).
     */
    equals(other) {
        return this.id === other.id;
    }
    /**
     * Returns a hash code for this fact (useful for Set operations).
     */
    hashCode() {
        return this.id.toString();
    }
}
exports.Fact = Fact;
//# sourceMappingURL=Fact.js.map