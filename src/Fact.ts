import { Topic } from './Topic';

/**
 * Type alias for source representation - can be expanded later if needed.
 */
export type Source = string;

/**
 * Represents a fact in the knowledge base system.
 * Facts contain content, are categorized by topics, and have sources.
 */
export class Fact {
  public readonly id: number;
  public readonly content: string;
  public readonly topics: Set<string>;
  public readonly sources: Set<Source>;

  constructor(
    id: number,
    content: string,
    topics: Set<string>,
    sources: Set<Source>
  ) {
    this.id = id;
    this.content = content;
    this.topics = new Set(topics); // Create a copy to ensure immutability
    this.sources = new Set(sources); // Create a copy to ensure immutability
  }

  /**
   * Creates a Fact instance from a plain object (e.g., from JSON data).
   */
  static fromObject(obj: {
    id: number;
    content: string;
    topics: string[]; // Array of topic names
    sources: Source[];
  }): Fact {
    const topics = new Set(obj.topics);
    const sources = new Set(obj.sources);

    return new Fact(obj.id, obj.content, topics, sources);
  }

  /**
   * Converts the Fact instance to a plain object for serialization.
   */
  toObject(): {
    id: number;
    content: string;
    topics: string[];
    sources: Source[];
  } {
    return {
      id: this.id,
      content: this.content,
      topics: Array.from(this.topics),
      sources: Array.from(this.sources),
    };
  }

  /**
   * Checks if this fact has a specific topic (by Topic object).
   */
  hasTopic(topic: Topic): boolean {
    return this.topics.has(topic.name);
  }

  /**
   * Checks if this fact has a specific topic (by topic name).
   */
  hasTopicName(topicName: string): boolean {
    return this.topics.has(topicName);
  }

  /**
   * Checks if this fact has any of the given topics (by Topic objects).
   */
  hasAnyTopic(topics: Topic[]): boolean {
    return topics.some(topic => this.hasTopic(topic));
  }

  /**
   * Checks if this fact has any of the given topic names.
   */
  hasAnyTopicName(topicNames: string[]): boolean {
    return topicNames.some(topicName => this.hasTopicName(topicName));
  }

  /**
   * Checks if this fact has all of the given topics (by Topic objects).
   */
  hasAllTopics(topics: Topic[]): boolean {
    return topics.every(topic => this.hasTopic(topic));
  }

  /**
   * Checks if this fact has all of the given topic names.
   */
  hasAllTopicNames(topicNames: string[]): boolean {
    return topicNames.every(topicName => this.hasTopicName(topicName));
  }

  /**
   * Returns all topic names as an array.
   */
  getTopicNames(): string[] {
    return Array.from(this.topics);
  }

  /**
   * Checks if this fact has a specific source.
   */
  hasSource(source: Source): boolean {
    return this.sources.has(source);
  }

  /**
   * Returns a string representation of the fact.
   */
  toString(): string {
    const topicList = Array.from(this.topics).join(', ');
    return `Fact(id=${this.id}, topics=[${topicList}], content="${this.content.substring(0, 50)}...")`;
  }

  /**
   * Checks if this fact is equal to another fact (by ID).
   */
  equals(other: Fact): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a hash code for this fact (useful for Set operations).
   */
  hashCode(): string {
    return this.id.toString();
  }
}