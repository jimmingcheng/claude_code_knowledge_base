#!/usr/bin/env node

/**
 * KbAddTopic Tool - Add topics to knowledge base with validation
 * Restricted to kb-agent use only for secure topic creation
 */

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Tool metadata for Claude Code
const TOOL_METADATA = {
  name: 'KbAddTopic',
  description: 'Add a new topic to the knowledge base with name validation',
  parameters: {
    name: {
      type: 'string',
      description: 'The topic name (will be validated and cleaned)',
      required: true
    },
    description: {
      type: 'string',
      description: 'Description of what this topic covers',
      required: true
    },
    isPersistent: {
      type: 'boolean',
      description: 'Whether this topic is persistent (protected from auto-modification)',
      required: false,
      default: false
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

// Validate and clean topic name
function validateAndCleanTopicName(name) {
  if (!name || name.trim() === '') {
    throw new Error('Topic name cannot be empty');
  }

  // Check for malformed topic names (the main issue we're fixing)
  if (name.includes('\n') || name.includes('\r')) {
    throw new Error(`Invalid topic name contains newlines: ${name.substring(0, 100)}...`);
  }

  // Check for excessive length (likely malformed content used as topic name)
  if (name.length > 100) {
    throw new Error(`Topic name too long (max 100 chars): ${name.substring(0, 50)}...`);
  }

  // Check for excessive punctuation (likely full content used as topic name)
  const punctuationCount = (name.match(/[.,;:!?(){}[\]]/g) || []).length;
  if (punctuationCount > name.length * 0.3) {
    throw new Error(`Topic name has excessive punctuation (likely malformed): ${name.substring(0, 50)}...`);
  }

  // Check for sentence-like structure (likely content used as topic name)
  const wordCount = name.split(/\s+/).length;
  if (wordCount > 8) {
    throw new Error(`Topic name too verbose (max 8 words): ${name.substring(0, 50)}...`);
  }

  // Clean and normalize the topic name
  let cleaned = name
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .trim();

  // For topic names, we preserve original case but clean dangerous characters
  cleaned = cleaned.replace(/[<>"|*?\\/:]/g, ''); // Remove filesystem-dangerous chars

  if (cleaned.length === 0) {
    throw new Error(`Topic name becomes empty after cleaning: ${name}`);
  }

  return cleaned;
}

// Validate topic description
function validateDescription(description) {
  if (!description || description.trim() === '') {
    throw new Error('Topic description cannot be empty');
  }

  if (description.length > 1000) {
    throw new Error('Topic description too long (max 1000 characters)');
  }

  return description.trim();
}

// Execute the add-topic command
async function executeAddTopic(name, description, isPersistent = false) {
  return new Promise((resolve, reject) => {
    try {
      // Validate and clean inputs
      const cleanedName = validateAndCleanTopicName(name);
      const cleanedDescription = validateDescription(description);

      console.error(`Debug: Adding topic "${cleanedName}" (persistent: ${isPersistent})`);

      const cliPath = findKbCli();

      // Build command arguments
      const cmdArgs = ['add-topic', cleanedName, cleanedDescription];

      if (isPersistent) {
        cmdArgs.push('true');
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
          reject(new Error(`Failed to add topic (exit code ${code}): ${stderr}`));
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to execute add-topic: ${err.message}`));
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
      console.error('Usage: node kb-add-topic.js <name> <description> [isPersistent]');
      process.exit(1);
    }

    const name = args[0];
    const description = args[1];
    const isPersistent = args[2] === 'true';

    const result = await executeAddTopic(name, description, isPersistent);
    console.log(result);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Export for tool integration
module.exports = {
  metadata: TOOL_METADATA,
  execute: executeAddTopic
};

// Run as CLI if called directly
if (require.main === module) {
  main();
}