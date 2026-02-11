import { Topic } from './Topic';
/**
 * Represents a fact in the knowledge base system.
 * Facts contain content, are categorized by topics, and reference sources by ID.
 */
export declare class Fact {
    readonly id: number;
    readonly content: string;
    readonly topics: Set<string>;
    readonly sourceIds: Set<number>;
    constructor(id: number, content: string, topics: Set<string>, sourceIds: Set<number>);
    /**
     * Creates a Fact instance from a plain object (e.g., from JSON data).
     * Handles backward compatibility: reads old `sources: string[]` field as empty sourceIds.
     * Migration of old string sources to Source entities happens in KnowledgeBase.
     */
    static fromObject(obj: {
        id: number;
        content: string;
        topics: string[];
        sourceIds?: number[];
        sources?: string[];
    }): Fact;
    /**
     * Converts the Fact instance to a plain object for serialization.
     */
    toObject(): {
        id: number;
        content: string;
        topics: string[];
        sourceIds: number[];
    };
    /**
     * Checks if this fact has a specific topic (by Topic object).
     */
    hasTopic(topic: Topic): boolean;
    /**
     * Checks if this fact has a specific topic (by topic name).
     */
    hasTopicName(topicName: string): boolean;
    /**
     * Checks if this fact has any of the given topics (by Topic objects).
     */
    hasAnyTopic(topics: Topic[]): boolean;
    /**
     * Checks if this fact has any of the given topic names.
     */
    hasAnyTopicName(topicNames: string[]): boolean;
    /**
     * Checks if this fact has all of the given topics (by Topic objects).
     */
    hasAllTopics(topics: Topic[]): boolean;
    /**
     * Checks if this fact has all of the given topic names.
     */
    hasAllTopicNames(topicNames: string[]): boolean;
    /**
     * Returns all topic names as an array.
     */
    getTopicNames(): string[];
    /**
     * Checks if this fact has a specific source by ID.
     */
    hasSourceId(id: number): boolean;
    /**
     * Returns a string representation of the fact.
     */
    toString(): string;
    /**
     * Checks if this fact is equal to another fact (by ID).
     */
    equals(other: Fact): boolean;
    /**
     * Returns a hash code for this fact (useful for Set operations).
     */
    hashCode(): string;
}
//# sourceMappingURL=Fact.d.ts.map