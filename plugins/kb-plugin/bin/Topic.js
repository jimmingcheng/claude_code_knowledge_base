"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topic = void 0;
/**
 * Represents a topic in the knowledge base system.
 * Topics are used to categorize and organize facts.
 */
class Topic {
    constructor(name, description, isPersistent = false) {
        this.id = name; // Use name as the unique identifier
        this.description = description;
        this.isPersistent = isPersistent;
    }
    /**
     * Gets the topic name (same as ID).
     */
    get name() {
        return this.id;
    }
    /**
     * Creates a Topic instance from a plain object (e.g., from JSON data).
     * Provides backward compatibility for data without isPersistent field and old isInferred field.
     */
    static fromObject(obj) {
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
    toObject() {
        return {
            id: this.id,
            description: this.description,
            isPersistent: this.isPersistent,
        };
    }
    /**
     * Returns a string representation of the topic.
     */
    toString() {
        const persistentFlag = this.isPersistent ? " [persistent]" : "";
        return `Topic(name="${this.name}"${persistentFlag})`;
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