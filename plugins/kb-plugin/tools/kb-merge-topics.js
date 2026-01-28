#!/usr/bin/env node

/**
 * KbMergeTopics Tool - Merge topics in knowledge base
 * Restricted to kb-agent use only for secure topic organization
 */

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Tool metadata for Claude Code
const TOOL_METADATA = {
  name: 'KbMergeTopics',
  description: 'Merge one topic into another, combining their facts',
  parameters: {
    sourceTopicName: {
      type: 'string',
      description: 'The name of the topic to merge (will be removed)',
      required: true
    },
    targetTopicName: {
      type: 'string',
      description: 'The name of the topic to merge into (will remain)',
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

// Validate topic name
function validateTopicName(name, label) {
  if (!name || name.trim() === '') {
    throw new Error(`${label} topic name cannot be empty`);
  }

  const cleanedName = name.trim();

  if (cleanedName.length > 100) {
    throw new Error(`${label} topic name too long (max 100 chars): ${cleanedName.substring(0, 50)}...`);
  }

  return cleanedName;
}

// Execute the merge-topics command
async function executeMergeTopics(sourceTopicName, targetTopicName) {
  return new Promise((resolve, reject) => {
    try {
      // Validate inputs
      const validSource = validateTopicName(sourceTopicName, 'Source');
      const validTarget = validateTopicName(targetTopicName, 'Target');

      if (validSource === validTarget) {
        throw new Error('Source and target topic names cannot be the same');
      }

      console.error(`Debug: Merging topic "${validSource}" into "${validTarget}"`);

      const cliPath = findKbCli();

      // Build command arguments
      const cmdArgs = ['merge-topics', validSource, validTarget];

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
          reject(new Error(`Failed to merge topics (exit code ${code}): ${stderr}`));
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to execute merge-topics: ${err.message}`));
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
      console.error('Usage: node kb-merge-topics.js <sourceTopicName> <targetTopicName>');
      process.exit(1);
    }

    const sourceTopicName = args[0];
    const targetTopicName = args[1];

    const result = await executeMergeTopics(sourceTopicName, targetTopicName);
    console.log(result);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Export for tool integration
module.exports = {
  metadata: TOOL_METADATA,
  execute: executeMergeTopics
};

// Run as CLI if called directly
if (require.main === module) {
  main();
}