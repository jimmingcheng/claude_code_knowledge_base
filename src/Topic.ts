/**
 * Represents a topic in the knowledge base system.
 * Topics are used to categorize and organize facts.
 */
export class Topic {
  public readonly id: string; // The topic name serves as the ID
  public readonly description: string;
  public readonly isPersistent: boolean; // True if user-created (persistent), false if auto-created

  constructor(name: string, description: string, isPersistent: boolean = false) {
    this.id = name; // Use name as the unique identifier
    this.description = description;
    this.isPersistent = isPersistent;
  }

  /**
   * Gets the topic name (same as ID).
   */
  get name(): string {
    return this.id;
  }

  /**
   * Creates a Topic instance from a plain object (e.g., from JSON data).
   * Provides backward compatibility for data without isPersistent field and old isInferred field.
   */
  static fromObject(obj: {
    id: string;
    description: string;
    isPersistent?: boolean;
    isInferred?: boolean; // Backward compatibility
  }): Topic {
    // Handle backward compatibility: isInferred=true means isPersistent=false
    let isPersistent = obj.isPersistent ?? false;
    if (obj.isInferred !== undefined && obj.isPersistent === undefined) {
      isPersistent = !obj.isInferred; // Invert for backward compatibility
    }
    return new Topic(obj.id, obj.description, isPersistent);
  }

  /**
   * Converts the Topic instance to a plain object for serialization.
   */
  toObject(): {
    id: string;
    description: string;
    isPersistent: boolean;
  } {
    return {
      id: this.id,
      description: this.description,
      isPersistent: this.isPersistent,
    };
  }

  /**
   * Returns a string representation of the topic.
   */
  toString(): string {
    const persistentFlag = this.isPersistent ? " [persistent]" : "";
    return `Topic(name="${this.name}"${persistentFlag})`;
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