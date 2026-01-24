/**
 * Represents a topic in the knowledge base system.
 * Topics are used to categorize and organize facts.
 */
export class Topic {
  public readonly id: string; // The topic name serves as the ID
  public readonly description: string;

  constructor(name: string, description: string) {
    this.id = name; // Use name as the unique identifier
    this.description = description;
  }

  /**
   * Gets the topic name (same as ID).
   */
  get name(): string {
    return this.id;
  }

  /**
   * Creates a Topic instance from a plain object (e.g., from JSON data).
   */
  static fromObject(obj: {
    id: string;
    description: string;
  }): Topic {
    return new Topic(obj.id, obj.description);
  }

  /**
   * Converts the Topic instance to a plain object for serialization.
   */
  toObject(): {
    id: string;
    description: string;
  } {
    return {
      id: this.id,
      description: this.description,
    };
  }

  /**
   * Returns a string representation of the topic.
   */
  toString(): string {
    return `Topic(name="${this.name}")`;
  }

  /**
   * Checks if this topic is equal to another topic (by name/ID).
   */
  equals(other: Topic): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a hash code for this topic (useful for Set operations).
   */
  hashCode(): string {
    return this.id;
  }
}