#!/usr/bin/env node

/**
 * KbRenameTopic Tool - Rename topics in knowledge base
 * Restricted to kb-agent use only for secure topic management
 */

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Tool metadata for Claude Code
const TOOL_METADATA = {
  name: 'KbRenameTopic',
  description: 'Rename an existing topic in the knowledge base',
  parameters: {
    oldName: {
      type: 'string',
      description: 'The current name of the topic to rename',
      required: true
    },
    newName: {
      type: 'string',
      description: 'The new name for the topic (will be validated and cleaned)',
      required: true
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

// Validate topic name (reuse logic from add-topic)
function validateTopicName(name, label) {
  if (!name || name.trim() === '') {
    throw new Error(`${label} topic name cannot be empty`);
  }

  const cleanedName = name.trim();

  if (cleanedName.length > 100) {
    throw new Error(`${label} topic name too long (max 100 chars): ${cleanedName.substring(0, 50)}...`);
  }

  // For new names, apply additional validation
  if (label === 'New') {
    // Check for malformed topic names (the main issue we're fixing)
    if (cleanedName.includes('\n') || cleanedName.includes('\r')) {
      throw new Error(`Invalid topic name contains newlines: ${cleanedName.substring(0, 100)}...`);
    }

    // Check for excessive punctuation (likely full content used as topic name)
    const punctuationCount = (cleanedName.match(/[.,;:!?(){}[\]]/g) || []).length;
    if (punctuationCount > cleanedName.length * 0.3) {
      throw new Error(`Topic name has excessive punctuation (likely malformed): ${cleanedName.substring(0, 50)}...`);
    }

    // Check for sentence-like structure (likely content used as topic name)
    const wordCount = cleanedName.split(/\s+/).length;
    if (wordCount > 8) {
      throw new Error(`Topic name too verbose (max 8 words): ${cleanedName.substring(0, 50)}...`);
    }

    // Clean dangerous characters
    const finalCleaned = cleanedName.replace(/[<>"|*?\\/:]/g, '');

    if (finalCleaned.length === 0) {
      throw new Error(`Topic name becomes empty after cleaning: ${name}`);
    }

    return finalCleaned;
  }

  return cleanedName;
}

// Execute the rename-topic command
async function executeRenameTopic(oldName, newName) {
  return new Promise((resolve, reject) => {
    try {
      // Validate inputs
      const validOldName = validateTopicName(oldName, 'Old');
      const validNewName = validateTopicName(newName, 'New');

      if (validOldName === validNewName) {
        throw new Error('Old and new topic names cannot be the same');
      }

      console.error(`Debug: Renaming topic "${validOldName}" to "${validNewName}"`);

      const cliPath = findKbCli();

      // Build command arguments
      const cmdArgs = ['rename-topic', validOldName, validNewName];

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
          reject(new Error(`Failed to rename topic (exit code ${code}): ${stderr}`));
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to execute rename-topic: ${err.message}`));
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
      console.error('Usage: node kb-rename-topic.js <oldName> <newName>');
      process.exit(1);
    }

    const oldName = args[0];
    const newName = args[1];

    const result = await executeRenameTopic(oldName, newName);
    console.log(result);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Export for tool integration
module.exports = {
  metadata: TOOL_METADATA,
  execute: executeRenameTopic
};

// Run as CLI if called directly
if (require.main === module) {
  main();
}