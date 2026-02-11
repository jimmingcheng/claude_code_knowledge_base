/**
 * Represents a source in the knowledge base system.
 * Sources are first-class entities that track where knowledge came from.
 */
export type SourceType = 'person' | 'url';

export class Source {
  public readonly id: number;
  public readonly type: SourceType;
  public readonly title: string;
  public readonly url?: string;
  public readonly addedAt: string; // ISO 8601 date (YYYY-MM-DD)

  constructor(id: number, type: SourceType, title: string, url?: string, addedAt?: string) {
    this.id = id;
    this.type = type;
    this.title = title;
    this.url = url;
    this.addedAt = addedAt ?? new Date().toISOString().split('T')[0];
  }

  /**
   * Creates a Source instance from a plain object (e.g., from JSON data).
   */
  static fromObject(obj: {
    id: number;
    type: SourceType;
    title: string;
    url?: string;
    addedAt: string;
  }): Source {
    return new Source(obj.id, obj.type, obj.title, obj.url, obj.addedAt);
  }

  /**
   * Converts the Source instance to a plain object for serialization.
   */
  toObject(): {
    id: number;
    type: SourceType;
    title: string;
    url?: string;
    addedAt: string;
  } {
    const obj: { id: number; type: SourceType; title: string; url?: string; addedAt: string } = {
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
  matchesUrl(url: string): boolean {
    return this.type === 'url' && this.url === url;
  }

  /**
   * Returns a string representation of the source.
   */
  toString(): string {
    if (this.type === 'url') {
      return `Source(id=${this.id}, type=url, title="${this.title}", url="${this.url}")`;
    }
    return `Source(id=${this.id}, type=person, title="${this.title}")`;
  }

  /**
   * Checks if this source is equal to another source (by ID).
   */
  equals(other: Source): boolean {
    return this.id === other.id;
  }

  /**
   * Returns a hash code for this source (useful for Set operations).
   */
  hashCode(): string {
    return this.id.toString();
  }
}
