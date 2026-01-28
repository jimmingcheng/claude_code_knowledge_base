/**
 * Represents metadata about the knowledge base stored in kb.json.
 * Provides context and description for what the knowledge base contains.
 */
export declare class KnowledgeBaseMetadata {
    readonly name: string;
    readonly description: string;
    constructor(name: string, description: string);
    /**
     * Creates a KnowledgeBaseMetadata instance from a plain object (e.g., from JSON data).
     */
    static fromObject(obj: {
        name: string;
        description: string;
    }): KnowledgeBaseMetadata;
    /**
     * Converts the KnowledgeBaseMetadata instance to a plain object for serialization.
     */
    toObject(): {
        name: string;
        description: string;
    };
    /**
     * Returns a string representation of the metadata.
     */
    toString(): string;
    /**
     * Checks if this metadata is equal to another metadata (by name and description).
     */
    equals(other: KnowledgeBaseMetadata): boolean;
}
//# sourceMappingURL=KnowledgeBaseMetadata.d.ts.map