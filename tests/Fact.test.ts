import { Fact, Source } from '../src/Fact';
import { Topic } from '../src/Topic';

describe('Fact', () => {
  describe('constructor', () => {
    it('should create a fact with all provided values', () => {
      const topics = new Set(['JavaScript', 'Programming']);
      const sources = new Set<Source>(['MDN docs', 'Personal experience']);

      const fact = new Fact(1, 'JavaScript is a dynamic programming language', topics, sources);

      expect(fact.id).toBe(1);
      expect(fact.content).toBe('JavaScript is a dynamic programming language');
      expect(fact.topics.size).toBe(2);
      expect(fact.topics.has('JavaScript')).toBe(true);
      expect(fact.topics.has('Programming')).toBe(true);
      expect(fact.sources.size).toBe(2);
      expect(fact.sources.has('MDN docs')).toBe(true);
      expect(fact.sources.has('Personal experience')).toBe(true);
    });

    it('should create a fact with empty topics and sources', () => {
      const fact = new Fact(2, 'Simple fact with no categorization', new Set(), new Set());

      expect(fact.id).toBe(2);
      expect(fact.content).toBe('Simple fact with no categorization');
      expect(fact.topics.size).toBe(0);
      expect(fact.sources.size).toBe(0);
    });

    it('should handle single topic and source', () => {
      const topics = new Set(['React']);
      const sources = new Set<Source>(['React documentation']);

      const fact = new Fact(3, 'React uses a virtual DOM for performance', topics, sources);

      expect(fact.topics.size).toBe(1);
      expect(fact.topics.has('React')).toBe(true);
      expect(fact.sources.size).toBe(1);
      expect(fact.sources.has('React documentation')).toBe(true);
    });

    it('should create immutable collections for topics and sources', () => {
      const originalTopics = new Set(['TypeScript', 'Programming']);
      const originalSources = new Set<Source>(['TypeScript handbook']);

      const fact = new Fact(4, 'TypeScript adds static typing to JavaScript', originalTopics, originalSources);

      // Modifying original sets should not affect the fact
      originalTopics.add('ExtraTopic');
      originalSources.add('extra-source');

      expect(fact.topics.size).toBe(2);
      expect(fact.sources.size).toBe(1);
      expect(fact.topics.has('ExtraTopic')).toBe(false);
      expect(fact.sources.has('extra-source')).toBe(false);
    });
  });

  describe('topic checking methods', () => {
    const fact = new Fact(10, 'Testing fact with multiple topics', new Set(['React', 'JavaScript', 'Frontend']), new Set(['Documentation']));

    describe('hasTopicName', () => {
      it('should return true for existing topic names', () => {
        expect(fact.hasTopicName('React')).toBe(true);
        expect(fact.hasTopicName('JavaScript')).toBe(true);
        expect(fact.hasTopicName('Frontend')).toBe(true);
      });

      it('should return false for non-existing topic names', () => {
        expect(fact.hasTopicName('Angular')).toBe(false);
        expect(fact.hasTopicName('Backend')).toBe(false);
      });

      it('should be case sensitive', () => {
        expect(fact.hasTopicName('react')).toBe(false); // case sensitive
        expect(fact.hasTopicName('React')).toBe(true);
      });
    });

    describe('hasTopic (by Topic object)', () => {
      it('should return true for existing topics', () => {
        const reactTopic = new Topic('React', 'React library');
        const jsTopic = new Topic('JavaScript', 'JavaScript language');

        expect(fact.hasTopic(reactTopic)).toBe(true);
        expect(fact.hasTopic(jsTopic)).toBe(true);
      });

      it('should return false for non-existing topics', () => {
        const angularTopic = new Topic('Angular', 'Angular framework');

        expect(fact.hasTopic(angularTopic)).toBe(false);
      });
    });

    describe('hasAnyTopicName', () => {
      it('should return true when at least one topic name matches', () => {
        expect(fact.hasAnyTopicName(['React'])).toBe(true);
        expect(fact.hasAnyTopicName(['Angular', 'React'])).toBe(true);
        expect(fact.hasAnyTopicName(['React', 'JavaScript', 'Frontend'])).toBe(true);
      });

      it('should return false when no topic names match', () => {
        expect(fact.hasAnyTopicName(['Angular'])).toBe(false);
        expect(fact.hasAnyTopicName(['Vue', 'Svelte'])).toBe(false);
        expect(fact.hasAnyTopicName([])).toBe(false);
      });
    });

    describe('hasAllTopicNames', () => {
      it('should return true when all topic names match', () => {
        expect(fact.hasAllTopicNames(['React', 'JavaScript'])).toBe(true);
        expect(fact.hasAllTopicNames(['Frontend'])).toBe(true);
        expect(fact.hasAllTopicNames(['React', 'JavaScript', 'Frontend'])).toBe(true);
      });

      it('should return false when not all topic names match', () => {
        expect(fact.hasAllTopicNames(['React', 'Angular'])).toBe(false);
        expect(fact.hasAllTopicNames(['React', 'JavaScript', 'Frontend', 'Vue'])).toBe(false);
      });

      it('should return true for empty array', () => {
        expect(fact.hasAllTopicNames([])).toBe(true);
      });
    });
  });

  describe('fromObject', () => {
    it('should create fact from plain object', () => {
      const obj = {
        id: 20,
        content: 'Node.js is a JavaScript runtime for server-side development',
        topics: ['Node.js', 'JavaScript', 'Backend'],
        sources: ['Node.js docs', 'Tutorial']
      };

      const fact = Fact.fromObject(obj);

      expect(fact).toBeInstanceOf(Fact);
      expect(fact.id).toBe(20);
      expect(fact.content).toBe('Node.js is a JavaScript runtime for server-side development');
      expect(fact.topics.size).toBe(3);
      expect(fact.topics.has('Node.js')).toBe(true);
      expect(fact.topics.has('JavaScript')).toBe(true);
      expect(fact.topics.has('Backend')).toBe(true);
      expect(fact.sources.size).toBe(2);
      expect(fact.sources.has('Node.js docs')).toBe(true);
      expect(fact.sources.has('Tutorial')).toBe(true);
    });

    it('should handle empty arrays in object', () => {
      const obj = {
        id: 21,
        content: 'Fact with no topics or sources',
        topics: [],
        sources: []
      };

      const fact = Fact.fromObject(obj);

      expect(fact.topics.size).toBe(0);
      expect(fact.sources.size).toBe(0);
    });
  });

  describe('toObject', () => {
    it('should convert fact to plain object', () => {
      const fact = new Fact(30, 'Vue.js is a progressive JavaScript framework', new Set(['Vue', 'JavaScript']), new Set(['Vue docs']));

      const obj = fact.toObject();

      expect(obj).toEqual({
        id: 30,
        content: 'Vue.js is a progressive JavaScript framework',
        topics: ['Vue', 'JavaScript'],
        sources: ['Vue docs']
      });
    });

    it('should handle empty sets', () => {
      const fact = new Fact(31, 'Standalone fact', new Set(), new Set());

      const obj = fact.toObject();

      expect(obj.topics).toEqual([]);
      expect(obj.sources).toEqual([]);
    });

    it('should preserve topic and source order (as arrays)', () => {
      const fact = new Fact(32, 'Order test', new Set(['A', 'B', 'C']), new Set(['source1', 'source2']));

      const obj = fact.toObject();

      expect(Array.isArray(obj.topics)).toBe(true);
      expect(Array.isArray(obj.sources)).toBe(true);
      expect(obj.topics.length).toBe(3);
      expect(obj.sources.length).toBe(2);
    });
  });

  describe('getTopicNames', () => {
    it('should return topic names as array', () => {
      const fact = new Fact(40, 'Test fact', new Set(['Python', 'Programming', 'Data-Science']), new Set());

      const topicNames = fact.getTopicNames();

      expect(Array.isArray(topicNames)).toBe(true);
      expect(topicNames.length).toBe(3);
      expect(topicNames).toContain('Python');
      expect(topicNames).toContain('Programming');
      expect(topicNames).toContain('Data-Science');
    });

    it('should return empty array for fact with no topics', () => {
      const fact = new Fact(41, 'No topics fact', new Set(), new Set());

      const topicNames = fact.getTopicNames();

      expect(topicNames).toEqual([]);
    });
  });

  describe('equals', () => {
    it('should return true for facts with identical IDs', () => {
      const fact1 = new Fact(50, 'Content 1', new Set(['Topic1']), new Set(['source1']));
      const fact2 = new Fact(50, 'Different Content', new Set(['Topic2']), new Set(['source2']));

      expect(fact1.equals(fact2)).toBe(true);
      expect(fact2.equals(fact1)).toBe(true);
    });

    it('should return false for facts with different IDs', () => {
      const fact1 = new Fact(51, 'Same Content', new Set(), new Set());
      const fact2 = new Fact(52, 'Same Content', new Set(), new Set());

      expect(fact1.equals(fact2)).toBe(false);
      expect(fact2.equals(fact1)).toBe(false);
    });

    it('should return true for same fact instance', () => {
      const fact = new Fact(53, 'Self test', new Set(), new Set());

      expect(fact.equals(fact)).toBe(true);
    });
  });

  describe('hashCode', () => {
    it('should return the fact ID as hash code', () => {
      const fact = new Fact(60, 'Hash test fact', new Set(), new Set());

      expect(fact.hashCode()).toBe('60');
    });

    it('should return same hash for facts with same ID', () => {
      const fact1 = new Fact(61, 'Fact 1', new Set(['Topic1']), new Set(['source1']));
      const fact2 = new Fact(61, 'Fact 2', new Set(['Topic2']), new Set(['source2']));

      expect(fact1.hashCode()).toBe(fact2.hashCode());
    });

    it('should return different hashes for different IDs', () => {
      const fact1 = new Fact(62, 'Fact', new Set(), new Set());
      const fact2 = new Fact(63, 'Fact', new Set(), new Set());

      expect(fact1.hashCode()).not.toBe(fact2.hashCode());
    });
  });

  describe('toString', () => {
    it('should return formatted string with topic names', () => {
      const fact = new Fact(70, 'Test content for toString', new Set(['React', 'JavaScript']), new Set(['docs']));

      const result = fact.toString();

      expect(result).toBe('Fact(id=70, topics=[React, JavaScript], content="Test content for toString...")');
    });

    it('should handle long content truncation', () => {
      const longContent = 'This is a very long content that should be truncated in the toString method when it exceeds the limit';
      const fact = new Fact(71, longContent, new Set(), new Set());

      const result = fact.toString();

      expect(result).toBe('Fact(id=71, topics=[], content="This is a very long content that should be truncat...")');
    });

    it('should handle empty content', () => {
      const fact = new Fact(72, '', new Set(['EmptyContent']), new Set());

      const result = fact.toString();

      expect(result).toBe('Fact(id=72, topics=[EmptyContent], content="...")');
    });

    it('should handle facts with no topics', () => {
      const fact = new Fact(73, 'No topics fact', new Set(), new Set());

      const result = fact.toString();

      expect(result).toBe('Fact(id=73, topics=[], content="No topics fact...")');
    });
  });

  describe('immutability', () => {
    it('should create copies of input sets during construction', () => {
      const originalTopics = new Set(['Original', 'Topics']);
      const originalSources = new Set(['original-source']);

      const fact = new Fact(80, 'Immutability test', originalTopics, originalSources);

      // Modifying original sets should not affect the fact
      originalTopics.add('ExtraTopic');
      originalSources.add('extra-source');

      // Verify fact is unchanged
      expect(fact.topics.size).toBe(2);
      expect(fact.sources.size).toBe(1);
      expect(fact.topics.has('ExtraTopic')).toBe(false);
      expect(fact.sources.has('extra-source')).toBe(false);
    });
  });

  describe('serialization roundtrip', () => {
    it('should maintain data integrity through fromObject -> toObject cycle', () => {
      const originalData = {
        id: 90,
        content: 'Roundtrip test fact content',
        topics: ['Testing', 'Serialization', 'Roundtrip'],
        sources: ['Test source', 'Another source']
      };

      const fact = Fact.fromObject(originalData);
      const serialized = fact.toObject();

      expect(serialized).toEqual(originalData);
    });

    it('should maintain data through constructor -> toObject -> fromObject cycle', () => {
      const original = new Fact(91, 'Full cycle test', new Set(['Cycle', 'Test']), new Set(['test-source']));

      const serialized = original.toObject();
      const deserialized = Fact.fromObject(serialized);

      expect(deserialized.id).toBe(original.id);
      expect(deserialized.content).toBe(original.content);
      expect(deserialized.topics.size).toBe(original.topics.size);
      expect(deserialized.sources.size).toBe(original.sources.size);
      expect(deserialized.equals(original)).toBe(true);

      // Check that all topics are preserved
      for (const topic of original.getTopicNames()) {
        expect(deserialized.hasTopicName(topic)).toBe(true);
      }
    });
  });
});