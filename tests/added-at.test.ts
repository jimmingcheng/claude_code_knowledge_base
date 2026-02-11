import { createKnowledgeBase } from '../src/index';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('addedAt field', () => {
  let testDir: string;
  const today = new Date().toISOString().split('T')[0];

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-addedat-test-'));
    const kb = createKnowledgeBase(testDir);
    kb.setMetadata('Test KB', 'Test');
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('new facts get today as addedAt', () => {
    const kb = createKnowledgeBase(testDir);
    const fact = kb.createFact('A new fact', new Set(['topic1']), new Set());

    expect(fact.addedAt).toBe(today);

    // Verify persisted
    const factsData = JSON.parse(fs.readFileSync(path.join(testDir, 'facts.json'), 'utf-8'));
    expect(factsData[0].addedAt).toBe(today);
  });

  test('new topics get today as addedAt', () => {
    const kb = createKnowledgeBase(testDir);
    const topic = kb.createTopic('my-topic', 'A topic', true);

    expect(topic.addedAt).toBe(today);

    // Verify persisted
    const topicsData = JSON.parse(fs.readFileSync(path.join(testDir, 'topics.json'), 'utf-8'));
    expect(topicsData[0].addedAt).toBe(today);
  });

  test('updateFact preserves original addedAt', () => {
    const kb = createKnowledgeBase(testDir);
    const fact = kb.createFact('Original content', new Set(['topic1']), new Set());
    const originalDate = fact.addedAt;

    const updated = kb.updateFact(fact.id, 'Updated content', new Set(['topic1']), new Set());

    expect(updated).not.toBeNull();
    expect(updated!.addedAt).toBe(originalDate);
  });

  test('updateTopic preserves original addedAt', () => {
    const kb = createKnowledgeBase(testDir);
    kb.createTopic('my-topic', 'Original description', true);
    const originalTopic = kb.findTopicByName('my-topic');
    const originalDate = originalTopic!.addedAt;

    const updated = kb.updateTopic('my-topic', 'Updated description');

    expect(updated).not.toBeNull();
    expect(updated!.addedAt).toBe(originalDate);
  });

  test('old data without addedAt loads with today as default', () => {
    // Write facts without addedAt
    fs.writeFileSync(path.join(testDir, 'facts.json'), JSON.stringify([
      { id: 1, content: 'Old fact', topics: ['topic1'], sourceIds: [] }
    ]), 'utf-8');
    // Write topics without addedAt
    fs.writeFileSync(path.join(testDir, 'topics.json'), JSON.stringify([
      { name: 'topic1', description: 'Old topic', isPersistent: false }
    ]), 'utf-8');

    const kb = createKnowledgeBase(testDir);

    const facts = kb.getAllFacts();
    expect(facts[0].addedAt).toBe(today);

    const topics = kb.getAllTopics();
    expect(topics[0].addedAt).toBe(today);
  });

  test('addedAt is preserved through renameTopic', () => {
    const kb = createKnowledgeBase(testDir);
    kb.createTopic('old-name', 'A topic', true);
    const originalDate = kb.findTopicByName('old-name')!.addedAt;

    kb.createFact('Fact with old topic', new Set(['old-name']), new Set());
    const originalFactDate = kb.getAllFacts()[0].addedAt;

    kb.renameTopic('old-name', 'new-name');

    const renamedTopic = kb.findTopicByName('new-name');
    expect(renamedTopic).toBeDefined();
    expect(renamedTopic!.addedAt).toBe(originalDate);

    const facts = kb.getAllFacts();
    expect(facts[0].addedAt).toBe(originalFactDate);
  });

  test('addedAt is preserved through mergeTopics', () => {
    const kb = createKnowledgeBase(testDir);
    kb.createTopic('source-topic', 'Source', true);
    kb.createTopic('target-topic', 'Target', true);
    kb.createFact('Fact with source topic', new Set(['source-topic']), new Set());
    const originalFactDate = kb.getAllFacts()[0].addedAt;

    kb.mergeTopics('source-topic', 'target-topic');

    const facts = kb.getAllFacts();
    expect(facts[0].addedAt).toBe(originalFactDate);
  });

  test('addedAt is preserved through setTopicPersistence', () => {
    const kb = createKnowledgeBase(testDir);
    kb.createTopic('my-topic', 'A topic', false);
    const originalDate = kb.findTopicByName('my-topic')!.addedAt;

    kb.setTopicPersistence('my-topic', true);

    const topic = kb.findTopicByName('my-topic');
    expect(topic!.isPersistent).toBe(true);
    expect(topic!.addedAt).toBe(originalDate);
  });
});
