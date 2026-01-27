/**
 * Represents a topic in the knowledge base system.
 * Topics are used to categorize and organize facts.
 */
export class Topic {
  public readonly id: string; // The topic name serves as the ID
  public readonly description: string;
  public readonly isInferred: boolean; // True if auto-created by agent, false if user-requested

  constructor(name: string, description: string, isInferred: boolean = false) {
    this.id = name; // Use name as the unique identifier
    this.description = description;
    this.isInferred = isInferred;
  }

  /**
   * Gets the topic name (same as ID).
   */
  get name(): string {
    return this.id;
  }

  /**
   * Creates a Topic instance from a plain object (e.g., from JSON data).
   * Provides backward compatibility for data without isInferred field.
   */
  static fromObject(obj: {
    id: string;
    description: string;
    isInferred?: boolean;
  }): Topic {
    return new Topic(obj.id, obj.description, obj.isInferred ?? false);
  }

  /**
   * Converts the Topic instance to a plain object for serialization.
   */
  toObject(): {
    id: string;
    description: string;
    isInferred: boolean;
  } {
    return {
      id: this.id,
      description: this.description,
      isInferred: this.isInferred,
    };
  }

  /**
   * Returns a string representation of the topic.
   */
  toString(): string {
    const inferredFlag = this.isInferred ? " [inferred]" : "";
    return `Topic(name="${this.name}"${inferredFlag})`;
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