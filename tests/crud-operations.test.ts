import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Basic CRUD Operations', () => {
  let testDir: string;
  let cliPath: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-test-'));
    cliPath = path.join(__dirname, '../src/cli.ts');
    // Initialize metadata for all tests
    execSync(`KB_PATH=${testDir} ts-node ${cliPath} set-metadata "Test KB" "Test description"`, {
      encoding: 'utf-8'
    });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  const runCLI = (args: string): string => {
    return execSync(`KB_PATH=${testDir} ts-node ${cliPath} ${args}`, {
      encoding: 'utf-8'
    });
  };

  test('create and retrieve fact', () => {
    // Add a fact
    const addResult = runCLI('add-fact "TypeScript is great" "typescript,programming"');
    expect(addResult).toContain('Created fact');

    // List facts
    const listResult = runCLI('list-facts');
    const facts = JSON.parse(listResult);

    expect(facts.length).toBe(1);
    expect(facts[0].content).toBe('TypeScript is great');
    expect(facts[0].topics).toContain('typescript');
    expect(facts[0].topics).toContain('programming');
  });

  test('fact auto-creates topics as non-persistent', () => {
    // Add fact with new topics
    runCLI('add-fact "Test content" "new-topic,another-topic"');

    // Check topics
    const topicsResult = runCLI('list-topics');
    const topics = JSON.parse(topicsResult);

    const newTopic = topics.find((t: any) => t.name === 'new-topic');
    const anotherTopic = topics.find((t: any) => t.name === 'another-topic');

    expect(newTopic).toBeDefined();
    expect(newTopic.isPersistent).toBe(false);
    expect(anotherTopic).toBeDefined();
    expect(anotherTopic.isPersistent).toBe(false);
  });

  test('add-topic creates persistent topic when isPersistent=true', () => {
    // Add persistent topic
    runCLI('add-topic "important-topic" "User-created topic" true');

    // Check topic
    const topicsResult = runCLI('list-topics');
    const topics = JSON.parse(topicsResult);

    const topic = topics.find((t: any) => t.name === 'important-topic');

    expect(topic).toBeDefined();
    expect(topic.isPersistent).toBe(true);
    expect(topic.description).toBe('User-created topic');
  });

  test('update-fact modifies content and topics', () => {
    // Add fact
    runCLI('add-fact "Original content" "topic1"');

    // Get fact ID
    const factsResult = runCLI('list-facts');
    const facts = JSON.parse(factsResult);
    const factId = facts[0].id;

    // Update fact
    runCLI(`update-fact ${factId} "Updated content" "topic2,topic3"`);

    // Verify update
    const updatedFactsResult = runCLI('list-facts');
    const updatedFacts = JSON.parse(updatedFactsResult);

    expect(updatedFacts[0].content).toBe('Updated content');
    expect(updatedFacts[0].topics).toContain('topic2');
    expect(updatedFacts[0].topics).toContain('topic3');
    expect(updatedFacts[0].topics).not.toContain('topic1');
  });

  test('remove-fact deletes fact', () => {
    // Add fact
    runCLI('add-fact "To be deleted" "topic"');

    // Get fact ID
    const factsResult = runCLI('list-facts');
    const facts = JSON.parse(factsResult);
    const factId = facts[0].id;

    // Remove fact
    runCLI(`remove-fact ${factId}`);

    // Verify deletion
    const afterDeleteResult = runCLI('list-facts');
    const afterDeleteFacts = JSON.parse(afterDeleteResult);

    expect(afterDeleteFacts.length).toBe(0);
  });
});
