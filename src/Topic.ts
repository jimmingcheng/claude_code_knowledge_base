/**
 * Represents a topic in the knowledge base system.
 * Topics are used to categorize and organize facts.
 */
export class Topic {
  public readonly name: string;
  public readonly description: string;
  public readonly isPersistent: boolean; // True if user-created (persistent), false if auto-created
  public readonly addedAt: string;

  constructor(name: string, description: string, isPersistent: boolean = false, addedAt?: string) {
    this.name = name;
    this.description = description;
    this.isPersistent = isPersistent;
    this.addedAt = addedAt ?? new Date().toISOString().split('T')[0];
  }

  /**
   * Creates a Topic instance from a plain object (e.g., from JSON data).
   * Provides backward compatibility for data without isPersistent field and old isInferred field.
   */
  static fromObject(obj: {
    name?: string;
    id?: string; // Backward compatibility
    description: string;
    isPersistent?: boolean;
    isInferred?: boolean; // Backward compatibility
    addedAt?: string;
  }): Topic {
    // Handle backward compatibility: use 'name' if available, otherwise fall back to 'id'
    const topicName = obj.name ?? obj.id;
    if (!topicName) {
      throw new Error('Topic must have either name or id field');
    }

    // Handle backward compatibility: isInferred=true means isPersistent=false
    let isPersistent = obj.isPersistent ?? false;
    if (obj.isInferred !== undefined && obj.isPersistent === undefined) {
      isPersistent = !obj.isInferred; // Invert for backward compatibility
    }
    return new Topic(topicName, obj.description, isPersistent, obj.addedAt);
  }

  /**
   * Converts the Topic instance to a plain object for serialization.
   */
  toObject(): {
    name: string;
    description: string;
    isPersistent: boolean;
    addedAt: string;
  } {
    return {
      name: this.name,
      description: this.description,
      isPersistent: this.isPersistent,
      addedAt: this.addedAt,
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
   * Checks if this topic is equal to another topic (by name).
   */
  equals(other: Topic): boolean {
    return this.name === other.name;
  }

  /**
   * Returns a hash code for this topic (useful for Set operations).
   */
  hashCode(): string {
    return this.name;
  }
}