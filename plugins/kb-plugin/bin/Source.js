"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Source = void 0;
class Source {
    constructor(id, type, title, url, addedAt) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.url = url;
        this.addedAt = addedAt ?? new Date().toISOString().split('T')[0];
    }
    /**
     * Creates a Source instance from a plain object (e.g., from JSON data).
     */
    static fromObject(obj) {
        return new Source(obj.id, obj.type, obj.title, obj.url, obj.addedAt);
    }
    /**
     * Converts the Source instance to a plain object for serialization.
     */
    toObject() {
        const obj = {
            id: this.id,
            type: this.type,
            title: this.title,
            addedAt: this.addedAt,
        };
        if (this.url !== undefined) {
            obj.url = this.url;
        }
        return obj;
    }
    /**
     * Checks if this source matches a given URL (for url-type deduplication).
     */
    matchesUrl(url) {
        return this.type === 'url' && this.url === url;
    }
    /**
     * Returns a string representation of the source.
     */
    toString() {
        if (this.type === 'url') {
            return `Source(id=${this.id}, type=url, title="${this.title}", url="${this.url}")`;
        }
        return `Source(id=${this.id}, type=person, title="${this.title}")`;
    }
    /**
     * Checks if this source is equal to another source (by ID).
     */
    equals(other) {
        return this.id === other.id;
    }
    /**
     * Returns a hash code for this source (useful for Set operations).
     */
    hashCode() {
        return this.id.toString();
    }
}
exports.Source = Source;
//# sourceMappingURL=Source.js.map