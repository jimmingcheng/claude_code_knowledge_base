#!/usr/bin/env node

/**
 * KbUpdateFact Tool - Update existing facts with validation
 * Restricted to kb-agent use only for secure fact updates
 */

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Tool metadata for Claude Code
const TOOL_METADATA = {
  name: 'KbUpdateFact',
  description: 'Update an existing fact in the knowledge base with validation',
  parameters: {
    id: {
      type: 'number',
      description: 'The ID of the fact to update',
      required: true
    },
    content: {
      type: 'string',
      description: 'The updated fact content',
      required: true
    },
    topics: {
      type: 'string',
      description: 'Comma-separated topic names (will be validated and cleaned)',
      required: false
    },
    sources: {
      type: 'string',
      description: 'Comma-separated source references',
      required: false
    }
  }
};

// Find the KB CLI using the same resolution logic
function findKbCli() {
  const pluginDir = __dirname;
  const cacheBase = path.join(process.env.HOME, '.claude/plugins/cache/claude-code-knowledge-base');

  let cliPath = path.join(pluginDir, '..', 'bin', 'claude-kb');

  if (!fs.existsSync(cliPath)) {
    const pluginRoot = path.resolve(pluginDir, '..');
    cliPath = path.join(pluginRoot, 'dist', 'cli.js');
  }

  if (!fs.existsSync(cliPath)) {
    const repoRoot = path.resolve(pluginDir, '../../..');
    cliPath = path.join(repoRoot, 'dist', 'cli.js');
  }

  if (!fs.existsSync(cliPath)) {
    if (fs.existsSync(cacheBase)) {
      const versions = fs.readdirSync(path.join(cacheBase, 'kb-plugin'))
        .filter(v => /^\d+/.test(v))
        .sort((a, b) => {
          const aVersion = a.split('.').map(Number);
          const bVersion = b.split('.').map(Number);
          for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
            const aPart = aVersion[i] || 0;
            const bPart = bVersion[i] || 0;
            if (aPart !== bPart) return bPart - aPart;
          }
          return 0;
        });

      for (const version of versions) {
        const versionPath = path.join(cacheBase, 'kb-plugin', version, 'bin', 'claude-kb');
        if (fs.existsSync(versionPath)) {
          cliPath = versionPath;
          break;
        }
      }
    }
  }

  if (!fs.existsSync(cliPath)) {
    throw new Error('KB CLI not found. Please ensure kb-plugin is properly installed.');
  }

  return cliPath;
}

// Reuse validation functions from kb-add-fact.js
function validateAndCleanTopics(topicsString) {
  if (!topicsString || topicsString.trim() === '') {
    return [];
  }

  const topics = topicsString.split(',').map(t => t.trim()).filter(t => t.length > 0);
  const cleanedTopics = [];

  for (const topic of topics) {
    if (topic.includes('\n') || topic.includes('\r')) {
      throw new Error(`Invalid topic name contains newlines: ${topic.substring(0, 100)}...`);
    }

    if (topic.length > 100) {
      throw new Error(`Topic name too long (max 100 chars): ${topic.substring(0, 50)}...`);
    }

    const punctuationCount = (topic.match(/[.,;:!?(){}[\]]/g) || []).length;
    if (punctuationCount > topic.length * 0.3) {
      throw new Error(`Topic name has excessive punctuation (likely malformed): ${topic.substring(0, 50)}...`);
    }

    if (topic.split(' ').length > 8) {
      throw new Error(`Topic name too verbose (max 8 words, likely should be content): ${topic.substring(0, 50)}...`);
    }

    let cleaned = topic
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    cleaned = cleaned.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

    if (cleaned.length === 0) {
      throw new Error(`Topic name becomes empty after cleaning: ${topic}`);
    }

    cleanedTopics.push(cleaned);
  }

  return cleanedTopics;
}

function validateContent(content) {
  if (!content || content.trim() === '') {
    throw new Error('Fact content cannot be empty');
  }

  if (content.length > 10000) {
    throw new Error('Fact content too long (max 10000 characters)');
  }

  const dangerousPatterns = [
    /^\s*rm\s+-rf/,
    /^\s*sudo\s+/,
    /;\s*rm\s/,
    /\|\s*rm\s/,
    /`.*`/,
    /\$\(/
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      throw new Error('Fact content contains potentially dangerous patterns');
    }
  }

  return content.trim();
}

function validateSources(sourcesString) {
  if (!sourcesString || sourcesString.trim() === '') {
    return [];
  }

  const sources = sourcesString.split(',').map(s => s.trim()).filter(s => s.length > 0);

  for (const source of sources) {
    if (source.length > 500) {
      throw new Error(`Source reference too long (max 500 chars): ${source.substring(0, 50)}...`);
    }
  }

  return sources;
}

// Validate fact ID
function validateFactId(id) {
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    throw new Error('Fact ID must be a positive integer');
  }
  return numId;
}

// Execute the update-fact command
async function executeUpdateFact(id, content, topics = '', sources = '') {
  return new Promise((resolve, reject) => {
    try {
      // Validate and clean inputs
      const validId = validateFactId(id);
      const cleanedContent = validateContent(content);
      const cleanedTopics = validateAndCleanTopics(topics);
      const cleanedSources = validateSources(sources);

      console.error(`Debug: Updating fact ${validId} with ${cleanedTopics.length} topics: ${cleanedTopics.join(', ')}`);

      const cliPath = findKbCli();

      // Build command arguments
      const cmdArgs = ['update-fact', validId.toString(), cleanedContent];

      if (cleanedTopics.length > 0) {
        cmdArgs.push(cleanedTopics.join(','));
      }

      if (cleanedSources.length > 0) {
        cmdArgs.push(cleanedSources.join(','));
      }

      // Determine execution method
      const isJsFile = cliPath.endsWith('.js');
      const executable = isJsFile ? 'node' : cliPath;
      const fullArgs = isJsFile ? [cliPath, ...cmdArgs] : cmdArgs;

      console.error(`Debug: Executing ${executable} ${fullArgs.join(' ')}`);

      const child = spawn(executable, fullArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: process.env
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('exit', (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Failed to update fact (exit code ${code}): ${stderr}`));
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to execute update-fact: ${err.message}`));
      });

    } catch (error) {
      reject(error);
    }
  });
}

// Main function for CLI execution
async function main() {
  try {
    const args = process.argv.slice(2);

    if (args.length < 2) {
      console.error('Usage: node kb-update-fact.js <id> <content> [topics] [sources]');
      process.exit(1);
    }

    const id = args[0];
    const content = args[1];
    const topics = args[2] || '';
    const sources = args[3] || '';

    const result = await executeUpdateFact(id, content, topics, sources);
    console.log(result);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Export for tool integration
module.exports = {
  metadata: TOOL_METADATA,
  execute: executeUpdateFact
};

// Run as CLI if called directly
if (require.main === module) {
  main();
}