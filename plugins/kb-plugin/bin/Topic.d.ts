/**
 * Represents a topic in the knowledge base system.
 * Topics are used to categorize and organize facts.
 */
export declare class Topic {
    readonly name: string;
    readonly description: string;
    readonly isPersistent: boolean;
    readonly addedAt: string;
    constructor(name: string, description: string, isPersistent?: boolean, addedAt?: string);
    /**
     * Creates a Topic instance from a plain object (e.g., from JSON data).
     * Provides backward compatibility for data without isPersistent field and old isInferred field.
     */
    static fromObject(obj: {
        name?: string;
        id?: string;
        description: string;
        isPersistent?: boolean;
        isInferred?: boolean;
        addedAt?: string;
    }): Topic;
    /**
     * Converts the Topic instance to a plain object for serialization.
     */
    toObject(): {
        name: string;
        description: string;
        isPersistent: boolean;
        addedAt: string;
    };
    /**
     * Returns a string representation of the topic.
     */
    toString(): string;
    /**
     * Checks if this topic is equal to another topic (by name).
     */
    equals(other: Topic): boolean;
    /**
     * Returns a hash code for this topic (useful for Set operations).
     */
    hashCode(): string;
}
//# sourceMappingURL=Topic.d.ts.map