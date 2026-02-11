import { createKnowledgeBase } from '../src/index';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('File Persistence', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('kb persists across instances', () => {
    // Create first instance and add data
    const kb1 = createKnowledgeBase(testDir);
    kb1.setMetadata('Test KB', 'Test description');
    kb1.createFact('Test fact content', new Set(['test-topic']), new Set());

    // Create second instance with same path
    const kb2 = createKnowledgeBase(testDir);

    // Verify data persisted
    const metadata = kb2.getMetadata();
    expect(metadata?.name).toBe('Test KB');
    expect(metadata?.description).toBe('Test description');

    const facts = kb2.getAllFacts();
    expect(facts.length).toBe(1);
    expect(facts[0].content).toBe('Test fact content');

    const topics = kb2.getAllTopics();
    expect(topics.length).toBe(1);
    expect(topics[0].name).toBe('test-topic');
  });

  test('kb.json structure is correct', () => {
    const kb = createKnowledgeBase(testDir);
    kb.setMetadata('My Knowledge Base', 'A test knowledge base');

    const kbJsonPath = path.join(testDir, 'kb.json');
    expect(fs.existsSync(kbJsonPath)).toBe(true);

    const data = JSON.parse(fs.readFileSync(kbJsonPath, 'utf-8'));

    expect(data).toHaveProperty('name', 'My Knowledge Base');
    expect(data).toHaveProperty('description', 'A test knowledge base');
    expect(Object.keys(data)).toEqual(['name', 'description']);
  });

  test('topics.json structure is correct', () => {
    const kb = createKnowledgeBase(testDir);
    kb.setMetadata('Test KB', 'Test');
    kb.createTopic('test-topic', 'Test topic description', true);

    const topicsJsonPath = path.join(testDir, 'topics.json');
    expect(fs.existsSync(topicsJsonPath)).toBe(true);

    const data = JSON.parse(fs.readFileSync(topicsJsonPath, 'utf-8'));

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0]).toHaveProperty('name', 'test-topic');
    expect(data[0]).toHaveProperty('description', 'Test topic description');
    expect(data[0]).toHaveProperty('isPersistent', true);
    expect(data[0]).toHaveProperty('addedAt');
  });

  test('facts.json structure is correct', () => {
    const kb = createKnowledgeBase(testDir);
    kb.setMetadata('Test KB', 'Test');
    const source = kb.createSource('url', 'Example', 'https://example.com');
    kb.createFact('Fact content', new Set(['topic1', 'topic2']), new Set([source.id]));

    const factsJsonPath = path.join(testDir, 'facts.json');
    expect(fs.existsSync(factsJsonPath)).toBe(true);

    const data = JSON.parse(fs.readFileSync(factsJsonPath, 'utf-8'));

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('content', 'Fact content');
    expect(data[0].topics).toEqual(['topic1', 'topic2']);
    expect(data[0].sourceIds).toEqual([source.id]);
    expect(data[0]).toHaveProperty('addedAt');

    // Verify sources.json was also created
    const sourcesJsonPath = path.join(testDir, 'sources.json');
    expect(fs.existsSync(sourcesJsonPath)).toBe(true);
    const sourcesData = JSON.parse(fs.readFileSync(sourcesJsonPath, 'utf-8'));
    expect(sourcesData.length).toBe(1);
    expect(sourcesData[0]).toHaveProperty('id', source.id);
    expect(sourcesData[0]).toHaveProperty('type', 'url');
    expect(sourcesData[0]).toHaveProperty('title', 'Example');
    expect(sourcesData[0]).toHaveProperty('url', 'https://example.com');
  });
});
