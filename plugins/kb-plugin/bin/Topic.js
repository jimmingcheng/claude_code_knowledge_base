"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topic = void 0;
/**
 * Represents a topic in the knowledge base system.
 * Topics are used to categorize and organize facts.
 */
class Topic {
    constructor(name, description) {
        this.id = name; // Use name as the unique identifier
        this.description = description;
    }
    /**
     * Gets the topic name (same as ID).
     */
    get name() {
        return this.id;
    }
    /**
     * Creates a Topic instance from a plain object (e.g., from JSON data).
     */
    static fromObject(obj) {
        return new Topic(obj.id, obj.description);
    }
    /**
     * Converts the Topic instance to a plain object for serialization.
     */
    toObject() {
        return {
            id: this.id,
            description: this.description,
        };
    }
    /**
     * Returns a string representation of the topic.
     */
    toString() {
        return `Topic(name="${this.name}")`;
    }
    /**
     * Checks if this topic is equal to another topic (by name/ID).
     */
    equals(other) {
        return this.id === other.id;
    }
    /**
     * Returns a hash code for this topic (useful for Set operations).
     */
    hashCode() {
        return this.id;
    }
}
exports.Topic = Topic;
//# sourceMappingURL=Topic.js.map