import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Metadata Validation (Critical - NEW)', () => {
  let testDir: string;
  let cliPath: string;

  beforeEach(() => {
    // Create temp directory for each test
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-test-'));
    cliPath = path.join(__dirname, '../src/cli.ts');
  });

  afterEach(() => {
    // Clean up temp directory
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  const runCLI = (args: string): { stdout: string; stderr: string; exitCode: number } => {
    try {
      const stdout = execSync(`KB_PATH=${testDir} ts-node ${cliPath} ${args}`, {
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      return { stdout, stderr: '', exitCode: 0 };
    } catch (error: any) {
      return {
        stdout: error.stdout?.toString() || '',
        stderr: error.stderr?.toString() || '',
        exitCode: error.status || 1
      };
    }
  };

  test('add-fact fails without metadata', () => {
    const result = runCLI('add-fact "test content" "test-topic"');

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('metadata not initialized');
    expect(result.stderr).toContain('set-metadata');
  });

  test('add-topic fails without metadata', () => {
    const result = runCLI('add-topic "test-topic" "test description"');

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('metadata not initialized');
    expect(result.stderr).toContain('cannot be run autonomously');
  });

  test('update-fact fails without metadata', () => {
    const result = runCLI('update-fact 1 "updated content" "topic"');

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('metadata not initialized');
  });

  test('set-metadata creates kb.json', () => {
    const result = runCLI('set-metadata "Test KB" "Test description"');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Test KB');

    const kbJsonPath = path.join(testDir, 'kb.json');
    expect(fs.existsSync(kbJsonPath)).toBe(true);

    const metadata = JSON.parse(fs.readFileSync(kbJsonPath, 'utf-8'));
    expect(metadata.name).toBe('Test KB');
    expect(metadata.description).toBe('Test description');
  });

  test('operations succeed after metadata is set', () => {
    // First set metadata
    runCLI('set-metadata "Test KB" "Test description"');

    // Now add-fact should work
    const result = runCLI('add-fact "test content" "test-topic"');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Created fact');
  });
});
