import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('CLI Smoke Tests', () => {
  let testDir: string;
  let cliPath: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-test-'));
    cliPath = path.join(__dirname, '../src/cli.ts');
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  const runCLI = (args: string): { exitCode: number; output: string } => {
    try {
      const output = execSync(`KB_PATH=${testDir} ts-node ${cliPath} ${args}`, {
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      return { exitCode: 0, output };
    } catch (error: any) {
      return {
        exitCode: error.status || 1,
        output: error.stderr?.toString() || error.stdout?.toString() || ''
      };
    }
  };

  test('info shows metadata and stats', () => {
    // Create metadata and data
    execSync(`KB_PATH=${testDir} ts-node ${cliPath} set-metadata "Test KB" "A test knowledge base"`, {
      encoding: 'utf-8'
    });
    execSync(`KB_PATH=${testDir} ts-node ${cliPath} add-fact "Fact 1" "topic1"`, {
      encoding: 'utf-8'
    });
    execSync(`KB_PATH=${testDir} ts-node ${cliPath} add-fact "Fact 2" "topic2"`, {
      encoding: 'utf-8'
    });

    // Run info
    const result = runCLI('info');

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Test KB');
    expect(result.output).toContain('A test knowledge base');
    expect(result.output).toContain('Topics: 2');
    expect(result.output).toContain('Facts: 2');
  });

  test('info without metadata shows warning', () => {
    const result = runCLI('info');

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('No metadata found');
    expect(result.output).toContain('set-metadata');
    expect(result.output).toContain('Topics: 0');
    expect(result.output).toContain('Facts: 0');
  });

  test('unknown command shows error', () => {
    const result = runCLI('invalid-command');

    expect(result.exitCode).not.toBe(0);
    expect(result.output).toContain('Unknown command');
  });

  test('list-topics returns empty array when no topics', () => {
    execSync(`KB_PATH=${testDir} ts-node ${cliPath} set-metadata "Test KB" "Test"`, {
      encoding: 'utf-8'
    });

    const result = runCLI('list-topics');

    expect(result.exitCode).toBe(0);
    const topics = JSON.parse(result.output);
    expect(Array.isArray(topics)).toBe(true);
    expect(topics.length).toBe(0);
  });

  test('list-facts returns empty array when no facts', () => {
    execSync(`KB_PATH=${testDir} ts-node ${cliPath} set-metadata "Test KB" "Test"`, {
      encoding: 'utf-8'
    });

    const result = runCLI('list-facts');

    expect(result.exitCode).toBe(0);
    const facts = JSON.parse(result.output);
    expect(Array.isArray(facts)).toBe(true);
    expect(facts.length).toBe(0);
  });

  test('facts-by-any-topics with no matches returns empty', () => {
    execSync(`KB_PATH=${testDir} ts-node ${cliPath} set-metadata "Test KB" "Test"`, {
      encoding: 'utf-8'
    });
    execSync(`KB_PATH=${testDir} ts-node ${cliPath} add-fact "Test" "existing-topic"`, {
      encoding: 'utf-8'
    });

    const result = runCLI('facts-by-any-topics "nonexistent-topic"');

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('No facts found');
  });

  test('facts-by-any-topics with matches returns facts', () => {
    execSync(`KB_PATH=${testDir} ts-node ${cliPath} set-metadata "Test KB" "Test"`, {
      encoding: 'utf-8'
    });
    execSync(`KB_PATH=${testDir} ts-node ${cliPath} add-fact "Fact about React" "react,frontend"`, {
      encoding: 'utf-8'
    });
    execSync(`KB_PATH=${testDir} ts-node ${cliPath} add-fact "Fact about Node" "nodejs,backend"`, {
      encoding: 'utf-8'
    });

    const result = runCLI('facts-by-any-topics "react,nodejs"');

    expect(result.exitCode).toBe(0);
    const facts = JSON.parse(result.output);
    expect(facts.length).toBe(2);
  });

  test('no command shows help', () => {
    const result = runCLI('');

    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('Usage: claude-kb');
    expect(result.output).toContain('set-metadata');
    expect(result.output).toContain('add-fact');
    expect(result.output).toContain('list-topics');
  });
});
