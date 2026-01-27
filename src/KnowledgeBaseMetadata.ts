/**
 * Represents metadata about the knowledge base stored in kb.json.
 * Provides context and description for what the knowledge base contains.
 */
export class KnowledgeBaseMetadata {
  public readonly name: string;
  public readonly description: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  /**
   * Creates a KnowledgeBaseMetadata instance from a plain object (e.g., from JSON data).
   */
  static fromObject(obj: {
    name: string;
    description: string;
  }): KnowledgeBaseMetadata {
    return new KnowledgeBaseMetadata(obj.name, obj.description);
  }

  /**
   * Converts the KnowledgeBaseMetadata instance to a plain object for serialization.
   */
  toObject(): {
    name: string;
    description: string;
  } {
    return {
      name: this.name,
      description: this.description,
    };
  }

  /**
   * Returns a string representation of the metadata.
   */
  toString(): string {
    return `KB: "${this.name}" - ${this.description}`;
  }

  /**
   * Checks if this metadata is equal to another metadata (by name and description).
   */
  equals(other: KnowledgeBaseMetadata): boolean {
    return this.name === other.name && this.description === other.description;
  }
}