"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeBaseMetadata = void 0;
/**
 * Represents metadata about the knowledge base stored in kb.json.
 * Provides context and description for what the knowledge base contains.
 */
class KnowledgeBaseMetadata {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }
    /**
     * Creates a KnowledgeBaseMetadata instance from a plain object (e.g., from JSON data).
     */
    static fromObject(obj) {
        return new KnowledgeBaseMetadata(obj.name, obj.description);
    }
    /**
     * Converts the KnowledgeBaseMetadata instance to a plain object for serialization.
     */
    toObject() {
        return {
            name: this.name,
            description: this.description,
        };
    }
    /**
     * Returns a string representation of the metadata.
     */
    toString() {
        return `KB: "${this.name}" - ${this.description}`;
    }
    /**
     * Checks if this metadata is equal to another metadata (by name and description).
     */
    equals(other) {
        return this.name === other.name && this.description === other.description;
    }
}
exports.KnowledgeBaseMetadata = KnowledgeBaseMetadata;
//# sourceMappingURL=KnowledgeBaseMetadata.js.map