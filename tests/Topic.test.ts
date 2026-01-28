import { Topic } from '../src/Topic';

describe('Topic', () => {
  describe('constructor', () => {
    it('should create a topic with all provided values', () => {
      const topic = new Topic('Programming', 'Programming concepts and techniques');

      expect(topic.id).toBe('Programming');
      expect(topic.name).toBe('Programming');
      expect(topic.description).toBe('Programming concepts and techniques');
      expect(topic.isPersistent).toBe(false); // Default value (auto-created)
    });

    it('should create a topic with isPersistent set to true', () => {
      const topic = new Topic('User-Created', 'User-created topic', true);

      expect(topic.id).toBe('User-Created');
      expect(topic.name).toBe('User-Created');
      expect(topic.description).toBe('User-created topic');
      expect(topic.isPersistent).toBe(true);
    });

    it('should create a topic with isPersistent explicitly set to false', () => {
      const topic = new Topic('Auto-Generated', 'Auto-generated topic', false);

      expect(topic.id).toBe('Auto-Generated');
      expect(topic.name).toBe('Auto-Generated');
      expect(topic.description).toBe('Auto-generated topic');
      expect(topic.isPersistent).toBe(false);
    });

    it('should create a topic with empty description', () => {
      const topic = new Topic('TypeScript', '');

      expect(topic.id).toBe('TypeScript');
      expect(topic.name).toBe('TypeScript');
      expect(topic.description).toBe('');
      expect(topic.isPersistent).toBe(false); // Default value (auto-created)
    });

    it('should handle special characters in name and description', () => {
      const topic = new Topic('Topic with "quotes"', 'Description with émojis 🚀');

      expect(topic.id).toBe('Topic with "quotes"');
      expect(topic.name).toBe('Topic with "quotes"');
      expect(topic.description).toBe('Description with émojis 🚀');
      expect(topic.isPersistent).toBe(false); // Default value (auto-created)
    });

    it('should use name as ID', () => {
      const topic = new Topic('React-Hooks', 'React hooks patterns');

      expect(topic.id).toBe(topic.name);
      expect(topic.id).toBe('React-Hooks');
      expect(topic.isPersistent).toBe(false); // Default value (auto-created)
    });
  });

  describe('fromObject', () => {
    it('should create topic from plain object', () => {
      const obj = {
        id: 'JavaScript',
        description: 'JavaScript language and ecosystem'
      };

      const topic = Topic.fromObject(obj);

      expect(topic).toBeInstanceOf(Topic);
      expect(topic.id).toBe('JavaScript');
      expect(topic.name).toBe('JavaScript');
      expect(topic.description).toBe('JavaScript language and ecosystem');
      expect(topic.isPersistent).toBe(false); // Default when not specified (auto-created)
    });

    it('should create topic with isPersistent false from object', () => {
      const obj = {
        id: 'Auto-Topic',
        description: 'Automatically created topic',
        isPersistent: false
      };

      const topic = Topic.fromObject(obj);

      expect(topic).toBeInstanceOf(Topic);
      expect(topic.id).toBe('Auto-Topic');
      expect(topic.name).toBe('Auto-Topic');
      expect(topic.description).toBe('Automatically created topic');
      expect(topic.isPersistent).toBe(false);
    });

    it('should create topic with isPersistent true from object', () => {
      const obj = {
        id: 'User-Topic',
        description: 'User-requested topic',
        isPersistent: true
      };

      const topic = Topic.fromObject(obj);

      expect(topic).toBeInstanceOf(Topic);
      expect(topic.id).toBe('User-Topic');
      expect(topic.name).toBe('User-Topic');
      expect(topic.description).toBe('User-requested topic');
      expect(topic.isPersistent).toBe(true);
    });

    it('should handle empty description in object', () => {
      const obj = {
        id: 'EmptyDesc',
        description: ''
      };

      const topic = Topic.fromObject(obj);

      expect(topic.id).toBe('EmptyDesc');
      expect(topic.name).toBe('EmptyDesc');
      expect(topic.description).toBe('');
      expect(topic.isPersistent).toBe(false); // Default when not specified (auto-created)
    });

    it('should preserve special characters from object', () => {
      const obj = {
        id: 'Topic/with\\special*chars',
        description: 'Line 1\nLine 2\tTabbed'
      };

      const topic = Topic.fromObject(obj);

      expect(topic.id).toBe('Topic/with\\special*chars');
      expect(topic.name).toBe('Topic/with\\special*chars');
      expect(topic.description).toBe('Line 1\nLine 2\tTabbed');
      expect(topic.isPersistent).toBe(false); // Default when not specified (auto-created)
    });
  });

  describe('toObject', () => {
    it('should convert topic to plain object', () => {
      const topic = new Topic('Web-Development', 'Web development practices and tools');

      const obj = topic.toObject();

      expect(obj).toEqual({
        id: 'Web-Development',
        description: 'Web development practices and tools',
        isPersistent: false
      });
    });

    it('should convert persistent topic to plain object', () => {
      const topic = new Topic('User-Created', 'User-created topic', true);

      const obj = topic.toObject();

      expect(obj).toEqual({
        id: 'User-Created',
        description: 'User-created topic',
        isPersistent: true
      });
    });

    it('should create object with no Topic class methods', () => {
      const topic = new Topic('Testing', 'Testing methodologies');

      const obj = topic.toObject();

      // Should not have Topic class methods
      expect((obj as any).equals).toBeUndefined();
      expect((obj as any).toString).not.toBe(topic.toString);
      expect((obj as any).hashCode).toBeUndefined();
    });
  });

  describe('toString', () => {
    it('should return formatted string with topic name', () => {
      const topic = new Topic('React', 'React library and patterns');

      const result = topic.toString();

      expect(result).toBe('Topic(name="React")');
    });

    it('should return formatted string with persistent flag for user-created topics', () => {
      const topic = new Topic('User-React', 'User-created React topic', true);

      const result = topic.toString();

      expect(result).toBe('Topic(name="User-React" [persistent])');
    });

    it('should handle quotes in name', () => {
      const topic = new Topic('Name with "quotes"', 'Description');

      const result = topic.toString();

      expect(result).toBe('Topic(name="Name with "quotes"")');
    });

    it('should handle empty name', () => {
      const topic = new Topic('', 'Empty name topic');

      const result = topic.toString();

      expect(result).toBe('Topic(name="")');
    });
  });

  describe('equals', () => {
    it('should return true for topics with identical names', () => {
      const topic1 = new Topic('JavaScript', 'First description');
      const topic2 = new Topic('JavaScript', 'Different description');

      expect(topic1.equals(topic2)).toBe(true);
      expect(topic2.equals(topic1)).toBe(true);
    });

    it('should return true for topics with same name regardless of isPersistent flag', () => {
      const autoTopic = new Topic('JavaScript', 'Auto-created topic', false);
      const persistentTopic = new Topic('JavaScript', 'User-created topic', true);

      expect(autoTopic.equals(persistentTopic)).toBe(true);
      expect(persistentTopic.equals(autoTopic)).toBe(true);
    });

    it('should return false for topics with different names', () => {
      const topic1 = new Topic('JavaScript', 'Same description');
      const topic2 = new Topic('TypeScript', 'Same description');

      expect(topic1.equals(topic2)).toBe(false);
      expect(topic2.equals(topic1)).toBe(false);
    });

    it('should return true for same topic instance', () => {
      const topic = new Topic('Self-Test', 'Testing self equality');

      expect(topic.equals(topic)).toBe(true);
    });

    it('should handle case sensitivity correctly', () => {
      const topic1 = new Topic('react', 'Lower case');
      const topic2 = new Topic('React', 'Upper case');

      expect(topic1.equals(topic2)).toBe(false);
    });
  });

  describe('hashCode', () => {
    it('should return the topic name as hash code', () => {
      const topic = new Topic('Node.js', 'Node.js runtime');

      expect(topic.hashCode()).toBe('Node.js');
    });

    it('should return same hash for topics with same name', () => {
      const topic1 = new Topic('Vue', 'Vue framework description 1');
      const topic2 = new Topic('Vue', 'Vue framework description 2');

      expect(topic1.hashCode()).toBe(topic2.hashCode());
    });

    it('should return different hashes for different names', () => {
      const topic1 = new Topic('Angular', 'Angular framework');
      const topic2 = new Topic('React', 'React library');

      expect(topic1.hashCode()).not.toBe(topic2.hashCode());
    });

    it('should handle special characters in hash', () => {
      const topic = new Topic('C++', 'C++ programming language');

      expect(topic.hashCode()).toBe('C++');
    });
  });

  describe('name getter', () => {
    it('should return the same value as id', () => {
      const topic = new Topic('Functional-Programming', 'FP concepts');

      expect(topic.name).toBe(topic.id);
      expect(topic.name).toBe('Functional-Programming');
    });
  });

  describe('immutability', () => {
    it('should have readonly properties', () => {
      const topic = new Topic('Immutable-Test', 'Testing immutability');

      // These should be readonly properties - TypeScript will catch at compile time
      expect(topic.id).toBe('Immutable-Test');
      expect(topic.name).toBe('Immutable-Test');
      expect(topic.description).toBe('Testing immutability');
    });
  });

  describe('serialization roundtrip', () => {
    it('should maintain data integrity through fromObject -> toObject cycle', () => {
      const originalData = {
        id: 'DevOps',
        description: 'DevOps practices and tooling'
      };

      const topic = Topic.fromObject(originalData);
      const serialized = topic.toObject();

      expect(serialized).toEqual({
        id: 'DevOps',
        description: 'DevOps practices and tooling',
        isPersistent: false // Default value added during serialization
      });
    });

    it('should maintain data integrity for persistent topics through roundtrip', () => {
      const originalData = {
        id: 'User-DevOps',
        description: 'User-created DevOps topic',
        isPersistent: true
      };

      const topic = Topic.fromObject(originalData);
      const serialized = topic.toObject();

      expect(serialized).toEqual(originalData);
    });

    it('should handle backward compatibility with isInferred field', () => {
      // Test old format with isInferred=true (auto-created) -> isPersistent=false
      const autoCreatedData = {
        id: 'Legacy-Auto',
        description: 'Legacy auto-created topic',
        isInferred: true
      };

      const autoTopic = Topic.fromObject(autoCreatedData);
      expect(autoTopic.isPersistent).toBe(false);

      // Test old format with isInferred=false (user-created) -> isPersistent=true
      const userCreatedData = {
        id: 'Legacy-User',
        description: 'Legacy user-created topic',
        isInferred: false
      };

      const userTopic = Topic.fromObject(userCreatedData);
      expect(userTopic.isPersistent).toBe(true);
    });

    it('should maintain data through constructor -> toObject -> fromObject cycle', () => {
      const original = new Topic('Machine-Learning', 'ML algorithms and techniques');

      const serialized = original.toObject();
      const deserialized = Topic.fromObject(serialized);

      expect(deserialized.id).toBe(original.id);
      expect(deserialized.name).toBe(original.name);
      expect(deserialized.description).toBe(original.description);
      expect(deserialized.equals(original)).toBe(true);
    });
  });
});