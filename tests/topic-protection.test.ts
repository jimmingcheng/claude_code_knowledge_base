import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Topic Protection (Critical Business Logic)', () => {
  let testDir: string;
  let cliPath: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-test-'));
    cliPath = path.join(__dirname, '../src/cli.ts');
    // Initialize metadata
    execSync(`KB_PATH=${testDir} ts-node ${cliPath} set-metadata "Test KB" "Test description"`, {
      encoding: 'utf-8'
    });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  const runCLI = (args: string): { success: boolean; output: string } => {
    try {
      const output = execSync(`KB_PATH=${testDir} ts-node ${cliPath} ${args}`, {
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: error.stderr?.toString() || error.stdout?.toString() || '' };
    }
  };

  test('cannot remove persistent topic', () => {
    // Create persistent topic
    runCLI('add-topic "important" "Important topic" true');

    // Try to remove it
    const result = runCLI('remove-topic "important"');

    expect(result.success).toBe(false);
    expect(result.output).toContain('Cannot remove persistent topic');
    expect(result.output).toContain('protected');

    // Verify topic still exists
    const topicsResult = runCLI('list-topics');
    expect(topicsResult.success).toBe(true);
    const topics = JSON.parse(topicsResult.output);
    expect(topics.find((t: any) => t.name === 'important')).toBeDefined();
  });

  test('can remove non-persistent topic', () => {
    // Create non-persistent topic (via fact)
    runCLI('add-fact "test" "auto-topic"');

    // Remove it
    const result = runCLI('remove-topic "auto-topic"');

    expect(result.success).toBe(true);
    expect(result.output).toContain('Removed topic');

    // Verify topic is gone
    const topicsResult = runCLI('list-topics');
    const topics = JSON.parse(topicsResult.output);
    expect(topics.find((t: any) => t.name === 'auto-topic')).toBeUndefined();
  });

  test('cannot rename persistent topic', () => {
    // Create persistent topic
    runCLI('add-topic "important" "Important topic" true');

    // Try to rename it
    const result = runCLI('rename-topic "important" "new-name"');

    expect(result.success).toBe(false);
    expect(result.output).toContain('Cannot rename persistent topic');
    expect(result.output).toContain('protected');
  });

  test('can rename non-persistent topic', () => {
    // Create non-persistent topic
    runCLI('add-fact "test" "old-name"');

    // Rename it
    const result = runCLI('rename-topic "old-name" "new-name"');

    expect(result.success).toBe(true);
    expect(result.output).toContain('Renamed topic');

    // Verify rename
    const topicsResult = runCLI('list-topics');
    const topics = JSON.parse(topicsResult.output);
    expect(topics.find((t: any) => t.name === 'new-name')).toBeDefined();
    expect(topics.find((t: any) => t.name === 'old-name')).toBeUndefined();
  });

  test('cannot merge from persistent topic', () => {
    // Create persistent and non-persistent topics
    runCLI('add-topic "persistent-source" "Persistent" true');
    runCLI('add-fact "test" "auto-target"');

    // Try to merge from persistent topic
    const result = runCLI('merge-topics "persistent-source" "auto-target"');

    expect(result.success).toBe(false);
    expect(result.output).toContain('Cannot merge from persistent topic');
    expect(result.output).toContain('protected');
  });

  test('can merge non-persistent into persistent', () => {
    // Create persistent target and non-persistent source
    runCLI('add-topic "persistent-target" "Persistent" true');
    runCLI('add-fact "test fact" "auto-source"');

    // Merge should succeed
    const result = runCLI('merge-topics "auto-source" "persistent-target"');

    expect(result.success).toBe(true);
    expect(result.output).toContain('Merged topic');

    // Verify source is gone and target remains
    const topicsResult = runCLI('list-topics');
    const topics = JSON.parse(topicsResult.output);
    expect(topics.find((t: any) => t.name === 'persistent-target')).toBeDefined();
    expect(topics.find((t: any) => t.name === 'auto-source')).toBeUndefined();
  });

  test('set-topic-persistence changes protection status', () => {
    // Create non-persistent topic
    runCLI('add-fact "test" "flexible-topic"');

    // Make it persistent
    const result = runCLI('set-topic-persistence "flexible-topic" true');

    expect(result.success).toBe(true);
    expect(result.output).toContain('persistent');
    expect(result.output).toContain('protected');

    // Verify it's now protected
    const removeResult = runCLI('remove-topic "flexible-topic"');
    expect(removeResult.success).toBe(false);
    expect(removeResult.output).toContain('Cannot remove persistent topic');
  });
});
