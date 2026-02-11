/**
 * Represents a source in the knowledge base system.
 * Sources are first-class entities that track where knowledge came from.
 */
export type SourceType = 'person' | 'url';
export declare class Source {
    readonly id: number;
    readonly type: SourceType;
    readonly title: string;
    readonly url?: string;
    readonly addedAt: string;
    constructor(id: number, type: SourceType, title: string, url?: string, addedAt?: string);
    /**
     * Creates a Source instance from a plain object (e.g., from JSON data).
     */
    static fromObject(obj: {
        id: number;
        type: SourceType;
        title: string;
        url?: string;
        addedAt: string;
    }): Source;
    /**
     * Converts the Source instance to a plain object for serialization.
     */
    toObject(): {
        id: number;
        type: SourceType;
        title: string;
        url?: string;
        addedAt: string;
    };
    /**
     * Checks if this source matches a given URL (for url-type deduplication).
     */
    matchesUrl(url: string): boolean;
    /**
     * Returns a string representation of the source.
     */
    toString(): string;
    /**
     * Checks if this source is equal to another source (by ID).
     */
    equals(other: Source): boolean;
    /**
     * Returns a hash code for this source (useful for Set operations).
     */
    hashCode(): string;
}
//# sourceMappingURL=Source.d.ts.map