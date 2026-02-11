import { createKnowledgeBase } from '../src/index';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Source CRUD', () => {
  let testDir: string;
  let cliPath: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-sources-test-'));
    cliPath = path.join(__dirname, '../src/cli.ts');
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

  test('add-source creates url-type source', () => {
    const result = runCLI('add-source url "Claude API docs" "https://docs.anthropic.com"');
    expect(result).toContain('Created source with ID');

    const sources = JSON.parse(runCLI('list-sources'));
    expect(sources.length).toBe(1);
    expect(sources[0].type).toBe('url');
    expect(sources[0].title).toBe('Claude API docs');
    expect(sources[0].url).toBe('https://docs.anthropic.com');
    expect(sources[0]).toHaveProperty('addedAt');
  });

  test('add-source creates person-type source', () => {
    const result = runCLI('add-source person "alice"');
    expect(result).toContain('Created source with ID');

    const sources = JSON.parse(runCLI('list-sources'));
    expect(sources.length).toBe(1);
    expect(sources[0].type).toBe('person');
    expect(sources[0].title).toBe('alice');
    expect(sources[0].url).toBeUndefined();
  });

  test('get-source returns single source', () => {
    runCLI('add-source person "bob"');
    const sources = JSON.parse(runCLI('list-sources'));
    const id = sources[0].id;

    const result = JSON.parse(runCLI(`get-source ${id}`));
    expect(result.id).toBe(id);
    expect(result.type).toBe('person');
    expect(result.title).toBe('bob');
  });

  test('remove-source removes source by ID', () => {
    runCLI('add-source person "to-remove"');
    const sources = JSON.parse(runCLI('list-sources'));
    const id = sources[0].id;

    const result = runCLI(`remove-source ${id}`);
    expect(result).toContain('Removed source');

    const afterSources = JSON.parse(runCLI('list-sources'));
    expect(afterSources.length).toBe(0);
  });

  test('url-type source deduplicates by URL', () => {
    runCLI('add-source url "First title" "https://example.com"');
    runCLI('add-source url "Second title" "https://example.com"');

    const sources = JSON.parse(runCLI('list-sources'));
    expect(sources.length).toBe(1);
    // Should keep the first title since it deduplicates
    expect(sources[0].title).toBe('First title');
  });

  test('fact-source relationship works', () => {
    runCLI('add-source url "Example" "https://example.com"');
    const sources = JSON.parse(runCLI('list-sources'));
    const sourceId = sources[0].id;

    runCLI(`add-fact "A fact with source" "test" "${sourceId}"`);

    const facts = JSON.parse(runCLI('list-facts'));
    expect(facts.length).toBe(1);
    expect(facts[0].sourceIds).toContain(sourceId);
  });

  test('stats includes totalSources', () => {
    runCLI('add-source person "alice"');
    runCLI('add-source url "Docs" "https://docs.example.com"');

    const stats = JSON.parse(runCLI('stats'));
    expect(stats.totalSources).toBe(2);
  });
});

describe('Source Migration', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kb-migration-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  test('migrates old-format facts with string sources to sourceIds', () => {
    // Write kb.json
    fs.writeFileSync(path.join(testDir, 'kb.json'), JSON.stringify({ name: 'Test', description: 'Test' }), 'utf-8');
    // Write topics.json
    fs.writeFileSync(path.join(testDir, 'topics.json'), JSON.stringify([
      { name: 'test', description: 'Test topic', isPersistent: false }
    ]), 'utf-8');
    // Write old-format facts.json with string sources
    fs.writeFileSync(path.join(testDir, 'facts.json'), JSON.stringify([
      { id: 1, content: 'Fact with URL source', topics: ['test'], sources: ['https://example.com'] },
      { id: 2, content: 'Fact with person source', topics: ['test'], sources: ['alice'] },
      { id: 3, content: 'Fact with no sources', topics: ['test'], sources: [] },
    ]), 'utf-8');

    // Load the KB — migration should happen automatically
    const kb = createKnowledgeBase(testDir);

    // Verify sources were created
    const sources = kb.getAllSources();
    expect(sources.length).toBe(2);

    const urlSource = sources.find(s => s.type === 'url');
    expect(urlSource).toBeDefined();
    expect(urlSource!.url).toBe('https://example.com');
    expect(urlSource!.title).toBe('https://example.com');

    const personSource = sources.find(s => s.type === 'person');
    expect(personSource).toBeDefined();
    expect(personSource!.title).toBe('alice');

    // Verify facts now use sourceIds
    const facts = kb.getAllFacts();
    expect(facts[0].sourceIds.has(urlSource!.id)).toBe(true);
    expect(facts[1].sourceIds.has(personSource!.id)).toBe(true);
    expect(facts[2].sourceIds.size).toBe(0);

    // Verify the JSON files were updated on disk
    const factsData = JSON.parse(fs.readFileSync(path.join(testDir, 'facts.json'), 'utf-8'));
    expect(factsData[0]).toHaveProperty('sourceIds');
    expect(factsData[0]).not.toHaveProperty('sources');
    expect(factsData[0]).toHaveProperty('addedAt');

    const sourcesData = JSON.parse(fs.readFileSync(path.join(testDir, 'sources.json'), 'utf-8'));
    expect(sourcesData.length).toBe(2);
  });

  test('does not migrate if facts already use sourceIds format', () => {
    // Write kb.json
    fs.writeFileSync(path.join(testDir, 'kb.json'), JSON.stringify({ name: 'Test', description: 'Test' }), 'utf-8');
    // Write topics.json
    fs.writeFileSync(path.join(testDir, 'topics.json'), '[]', 'utf-8');
    // Write new-format facts.json
    fs.writeFileSync(path.join(testDir, 'facts.json'), JSON.stringify([
      { id: 1, content: 'Modern fact', topics: ['test'], sourceIds: [1] },
    ]), 'utf-8');
    // Write sources.json
    fs.writeFileSync(path.join(testDir, 'sources.json'), JSON.stringify([
      { id: 1, type: 'url', title: 'Example', url: 'https://example.com', addedAt: '2025-01-01' },
    ]), 'utf-8');

    const kb = createKnowledgeBase(testDir);

    // Verify nothing changed
    const facts = kb.getAllFacts();
    expect(facts[0].sourceIds.has(1)).toBe(true);

    const sources = kb.getAllSources();
    expect(sources.length).toBe(1);
  });
});
