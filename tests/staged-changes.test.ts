import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Staged Changes', () => {
  let testDir: string;
  let cliPath: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-staged-test-'));
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

  const runCLIExpectFail = (args: string): string => {
    try {
      execSync(`KB_PATH=${testDir} ts-node ${cliPath} ${args}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      throw new Error('Expected command to fail');
    } catch (error: any) {
      return error.stderr || error.message;
    }
  };

  const makeStagedJson = (changes: any[], summary = 'Test staging'): string => {
    const staged = {
      stagedAt: new Date().toISOString(),
      summary,
      changes,
    };
    return JSON.stringify(staged);
  };

  test('stage-changes writes staged-changes.json correctly', () => {
    const json = makeStagedJson([
      {
        id: 1,
        operation: 'add-fact',
        params: { content: 'Test fact', topics: ['test'], sourceIds: [] },
        description: 'Add test fact',
        stagingReasons: ['batch'],
      },
    ]);

    const result = runCLI(`stage-changes '${json}'`);
    expect(result).toContain('Staged 1 change(s)');

    // Verify file was written
    const filePath = path.join(testDir, 'staged-changes.json');
    expect(fs.existsSync(filePath)).toBe(true);

    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(fileContent.changes.length).toBe(1);
    expect(fileContent.changes[0].operation).toBe('add-fact');
    expect(fileContent.summary).toBe('Test staging');
  });

  test('list-staged outputs correct JSON', () => {
    const json = makeStagedJson([
      {
        id: 1,
        operation: 'add-fact',
        params: { content: 'Fact 1', topics: ['t1'], sourceIds: [] },
        description: 'Add fact 1',
        stagingReasons: ['batch'],
      },
      {
        id: 2,
        operation: 'add-topic',
        params: { name: 'new-topic', description: 'A new topic', isPersistent: true },
        description: 'Add new topic',
        stagingReasons: ['batch'],
      },
    ]);

    runCLI(`stage-changes '${json}'`);
    const listResult = runCLI('list-staged');
    const parsed = JSON.parse(listResult);

    expect(parsed.changes.length).toBe(2);
    expect(parsed.changes[0].operation).toBe('add-fact');
    expect(parsed.changes[1].operation).toBe('add-topic');
  });

  test('list-staged when no staged file shows message', () => {
    const result = runCLI('list-staged');
    expect(result).toContain('No staged changes');
  });

  test('apply-staged all applies all changes and clears file', () => {
    const json = makeStagedJson([
      {
        id: 1,
        operation: 'add-fact',
        params: { content: 'Staged fact one', topics: ['staging-test'], sourceIds: [] },
        description: 'Add staged fact one',
        stagingReasons: ['batch'],
      },
      {
        id: 2,
        operation: 'add-fact',
        params: { content: 'Staged fact two', topics: ['staging-test'], sourceIds: [] },
        description: 'Add staged fact two',
        stagingReasons: ['batch'],
      },
    ]);

    runCLI(`stage-changes '${json}'`);
    const applyResult = runCLI('apply-staged all');
    expect(applyResult).toContain('Applied 2 change(s)');

    // Verify facts were created
    const factsResult = runCLI('list-facts');
    const facts = JSON.parse(factsResult);
    expect(facts.length).toBe(2);
    expect(facts.some((f: any) => f.content === 'Staged fact one')).toBe(true);
    expect(facts.some((f: any) => f.content === 'Staged fact two')).toBe(true);

    // Verify staged file was cleared
    const stagedPath = path.join(testDir, 'staged-changes.json');
    expect(fs.existsSync(stagedPath)).toBe(false);
  });

  test('apply-staged selective applies selected changes and keeps rest', () => {
    const json = makeStagedJson([
      {
        id: 1,
        operation: 'add-fact',
        params: { content: 'Apply this', topics: ['test'], sourceIds: [] },
        description: 'Apply this fact',
        stagingReasons: ['batch'],
      },
      {
        id: 2,
        operation: 'add-fact',
        params: { content: 'Keep staged', topics: ['test'], sourceIds: [] },
        description: 'Keep this staged',
        stagingReasons: ['batch'],
      },
      {
        id: 3,
        operation: 'add-fact',
        params: { content: 'Also apply', topics: ['test'], sourceIds: [] },
        description: 'Also apply this',
        stagingReasons: ['batch'],
      },
    ]);

    runCLI(`stage-changes '${json}'`);
    const applyResult = runCLI('apply-staged 1,3');
    expect(applyResult).toContain('Applied 2 change(s)');
    expect(applyResult).toContain('1 remaining');

    // Verify only selected facts were created
    const factsResult = runCLI('list-facts');
    const facts = JSON.parse(factsResult);
    expect(facts.length).toBe(2);
    expect(facts.some((f: any) => f.content === 'Apply this')).toBe(true);
    expect(facts.some((f: any) => f.content === 'Also apply')).toBe(true);
    expect(facts.some((f: any) => f.content === 'Keep staged')).toBe(false);

    // Verify remaining staged change
    const listResult = runCLI('list-staged');
    const staged = JSON.parse(listResult);
    expect(staged.changes.length).toBe(1);
    expect(staged.changes[0].id).toBe(2);
  });

  test('reject-staged all clears without applying', () => {
    const json = makeStagedJson([
      {
        id: 1,
        operation: 'add-fact',
        params: { content: 'Should not be added', topics: ['test'], sourceIds: [] },
        description: 'This should be rejected',
        stagingReasons: ['batch'],
      },
    ]);

    runCLI(`stage-changes '${json}'`);
    const rejectResult = runCLI('reject-staged all');
    expect(rejectResult).toContain('Rejected 1 staged change(s)');

    // Verify no facts were created
    const factsResult = runCLI('list-facts');
    const facts = JSON.parse(factsResult);
    expect(facts.length).toBe(0);

    // Verify staged file was cleared
    const stagedPath = path.join(testDir, 'staged-changes.json');
    expect(fs.existsSync(stagedPath)).toBe(false);
  });

  test('reject-staged selective removes selected and keeps rest', () => {
    const json = makeStagedJson([
      {
        id: 1,
        operation: 'add-fact',
        params: { content: 'Keep this', topics: ['test'], sourceIds: [] },
        description: 'Keep this staged',
        stagingReasons: ['batch'],
      },
      {
        id: 2,
        operation: 'add-fact',
        params: { content: 'Reject this', topics: ['test'], sourceIds: [] },
        description: 'Reject this',
        stagingReasons: ['batch'],
      },
      {
        id: 3,
        operation: 'add-fact',
        params: { content: 'Also keep', topics: ['test'], sourceIds: [] },
        description: 'Also keep this',
        stagingReasons: ['batch'],
      },
    ]);

    runCLI(`stage-changes '${json}'`);
    const rejectResult = runCLI('reject-staged 2');
    expect(rejectResult).toContain('Rejected 1 change(s)');
    expect(rejectResult).toContain('2 remaining');

    // Verify remaining staged changes
    const listResult = runCLI('list-staged');
    const staged = JSON.parse(listResult);
    expect(staged.changes.length).toBe(2);
    expect(staged.changes.some((c: any) => c.id === 1)).toBe(true);
    expect(staged.changes.some((c: any) => c.id === 3)).toBe(true);
    expect(staged.changes.some((c: any) => c.id === 2)).toBe(false);
  });

  test('apply after partial rejection leaves correct state', () => {
    const json = makeStagedJson([
      {
        id: 1,
        operation: 'add-fact',
        params: { content: 'Fact A', topics: ['test'], sourceIds: [] },
        description: 'Add fact A',
        stagingReasons: ['batch'],
      },
      {
        id: 2,
        operation: 'add-fact',
        params: { content: 'Fact B (reject)', topics: ['test'], sourceIds: [] },
        description: 'Add fact B',
        stagingReasons: ['batch'],
      },
      {
        id: 3,
        operation: 'add-fact',
        params: { content: 'Fact C', topics: ['test'], sourceIds: [] },
        description: 'Add fact C',
        stagingReasons: ['batch'],
      },
    ]);

    runCLI(`stage-changes '${json}'`);

    // Reject one
    runCLI('reject-staged 2');

    // Apply remaining
    const applyResult = runCLI('apply-staged all');
    expect(applyResult).toContain('Applied 2 change(s)');

    // Verify correct facts exist
    const factsResult = runCLI('list-facts');
    const facts = JSON.parse(factsResult);
    expect(facts.length).toBe(2);
    expect(facts.some((f: any) => f.content === 'Fact A')).toBe(true);
    expect(facts.some((f: any) => f.content === 'Fact C')).toBe(true);
    expect(facts.some((f: any) => f.content === 'Fact B (reject)')).toBe(false);
  });

  test('stage-changes with invalid JSON fails', () => {
    const result = runCLIExpectFail("stage-changes 'not json'");
    expect(result).toContain('Invalid JSON');
  });

  test('stage-changes with missing required fields fails', () => {
    const result = runCLIExpectFail(`stage-changes '{"stagedAt":"2025-01-01"}'`);
    expect(result).toContain('Invalid staged changes format');
  });

  test('clear-staged when no staged file is a no-op', () => {
    const result = runCLI('clear-staged');
    expect(result).toContain('No staged changes to clear');
  });

  test('clear-staged clears all staged changes', () => {
    const json = makeStagedJson([
      {
        id: 1,
        operation: 'add-fact',
        params: { content: 'Should be cleared', topics: ['test'], sourceIds: [] },
        description: 'This will be cleared',
        stagingReasons: ['batch'],
      },
    ]);

    runCLI(`stage-changes '${json}'`);
    const clearResult = runCLI('clear-staged');
    expect(clearResult).toContain('Rejected 1 staged change(s)');

    // Verify staged file was removed
    const stagedPath = path.join(testDir, 'staged-changes.json');
    expect(fs.existsSync(stagedPath)).toBe(false);
  });

  test('apply-staged with various operations', () => {
    // First add a fact directly so we can update/remove it
    runCLI('add-fact "Original fact" "original-topic"');

    // Get the fact ID
    const factsResult = runCLI('list-facts');
    const facts = JSON.parse(factsResult);
    const factId = facts[0].id;

    const json = makeStagedJson([
      {
        id: 1,
        operation: 'add-topic',
        params: { name: 'staged-topic', description: 'Created via staging', isPersistent: true },
        description: 'Add new topic',
        stagingReasons: ['batch'],
      },
      {
        id: 2,
        operation: 'update-fact',
        params: { id: factId, content: 'Updated via staging', topics: ['original-topic', 'staged-topic'], sourceIds: [] },
        description: 'Update existing fact',
        stagingReasons: ['batch'],
      },
      {
        id: 3,
        operation: 'add-fact',
        params: { content: 'New staged fact', topics: ['staged-topic'], sourceIds: [] },
        description: 'Add new fact',
        stagingReasons: ['batch'],
      },
    ]);

    runCLI(`stage-changes '${json}'`);
    const applyResult = runCLI('apply-staged all');
    expect(applyResult).toContain('Applied 3 change(s)');

    // Verify topic was created
    const topicsResult = runCLI('list-topics');
    const topics = JSON.parse(topicsResult);
    const stagedTopic = topics.find((t: any) => t.name === 'staged-topic');
    expect(stagedTopic).toBeDefined();
    expect(stagedTopic.isPersistent).toBe(true);

    // Verify fact was updated
    const updatedFactsResult = runCLI('list-facts');
    const updatedFacts = JSON.parse(updatedFactsResult);
    const updatedFact = updatedFacts.find((f: any) => f.id === factId);
    expect(updatedFact.content).toBe('Updated via staging');
    expect(updatedFact.topics).toContain('staged-topic');

    // Verify new fact was added
    const newFact = updatedFacts.find((f: any) => f.content === 'New staged fact');
    expect(newFact).toBeDefined();
  });

  test('apply-staged with remove-fact operation', () => {
    // Add a fact first
    runCLI('add-fact "To be removed" "test-topic"');
    const factsResult = runCLI('list-facts');
    const facts = JSON.parse(factsResult);
    const factId = facts[0].id;

    const json = makeStagedJson([
      {
        id: 1,
        operation: 'remove-fact',
        params: { id: factId },
        description: 'Remove the fact',
        stagingReasons: ['batch'],
      },
    ]);

    runCLI(`stage-changes '${json}'`);
    runCLI('apply-staged all');

    // Verify fact was removed
    const afterResult = runCLI('list-facts');
    const afterFacts = JSON.parse(afterResult);
    expect(afterFacts.length).toBe(0);
  });

  test('apply-staged with merge-topics operation', () => {
    // Set up two topics with facts
    runCLI('add-fact "Fact about source" "source-topic"');
    runCLI('add-fact "Fact about target" "target-topic"');

    const json = makeStagedJson([
      {
        id: 1,
        operation: 'merge-topics',
        params: { source: 'source-topic', target: 'target-topic' },
        description: 'Merge source into target',
        stagingReasons: ['reorganization'],
      },
    ]);

    runCLI(`stage-changes '${json}'`);
    const result = runCLI('apply-staged all');
    expect(result).toContain('Merged topic');

    // Verify source topic was removed
    const topicsResult = runCLI('list-topics');
    const topics = JSON.parse(topicsResult);
    expect(topics.some((t: any) => t.name === 'source-topic')).toBe(false);
    expect(topics.some((t: any) => t.name === 'target-topic')).toBe(true);
  });

  test('apply-staged with rename-topic operation', () => {
    runCLI('add-fact "Some fact" "old-name"');

    const json = makeStagedJson([
      {
        id: 1,
        operation: 'rename-topic',
        params: { oldName: 'old-name', newName: 'new-name' },
        description: 'Rename topic',
        stagingReasons: ['reorganization'],
      },
    ]);

    runCLI(`stage-changes '${json}'`);
    runCLI('apply-staged all');

    // Verify rename
    const topicsResult = runCLI('list-topics');
    const topics = JSON.parse(topicsResult);
    expect(topics.some((t: any) => t.name === 'old-name')).toBe(false);
    expect(topics.some((t: any) => t.name === 'new-name')).toBe(true);
  });

  test('apply-staged with add-source operation', () => {
    const json = makeStagedJson([
      {
        id: 1,
        operation: 'add-source',
        params: { type: 'url', title: 'Example Site', url: 'https://example.com' },
        description: 'Add example source',
        stagingReasons: ['batch'],
      },
    ]);

    runCLI(`stage-changes '${json}'`);
    const result = runCLI('apply-staged all');
    expect(result).toContain('Added source');

    // Verify source was created
    const sourcesResult = runCLI('list-sources');
    const sources = JSON.parse(sourcesResult);
    expect(sources.length).toBe(1);
    expect(sources[0].type).toBe('url');
    expect(sources[0].title).toBe('Example Site');
    expect(sources[0].url).toBe('https://example.com');
  });

  test('apply-staged with add-source refId mapping', () => {
    const json = makeStagedJson([
      {
        id: 1,
        operation: 'add-source',
        params: { type: 'url', title: 'Claude API docs', url: 'https://docs.anthropic.com', refId: 100 },
        description: 'Add source for Claude API docs',
        stagingReasons: ['batch'],
      },
      {
        id: 2,
        operation: 'add-fact',
        params: { content: 'Uses Claude API', topics: ['api'], sourceIds: [100] },
        description: 'Add fact about Claude API',
        stagingReasons: ['batch'],
      },
    ]);

    runCLI(`stage-changes '${json}'`);
    const result = runCLI('apply-staged all');
    expect(result).toContain('Added source');
    expect(result).toContain('Added fact');

    // Verify source was created
    const sourcesResult = runCLI('list-sources');
    const sources = JSON.parse(sourcesResult);
    expect(sources.length).toBe(1);
    const sourceId = sources[0].id;

    // Verify fact references the real source ID (not the refId 100)
    const factsResult = runCLI('list-facts');
    const facts = JSON.parse(factsResult);
    expect(facts.length).toBe(1);
    expect(facts[0].sourceIds).toContain(sourceId);
  });
});
