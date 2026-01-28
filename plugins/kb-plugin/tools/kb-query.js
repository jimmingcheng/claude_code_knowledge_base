#!/usr/bin/env node

/**
 * KbQuery Tool - Read-only knowledge base operations
 * Provides secure query access to knowledge base without mutation capabilities
 */

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Tool metadata for Claude Code
const TOOL_METADATA = {
  name: 'KbQuery',
  description: 'Query knowledge base information (read-only operations)',
  parameters: {
    command: {
      type: 'string',
      description: 'Query command (info, list-topics, list-facts, facts-by-any-topics, facts-by-all-topics)',
      required: true
    },
    args: {
      type: 'string',
      description: 'Command arguments (e.g., topic names for facts-by-* commands)',
      required: false
    }
  }
};

// Allowed read-only commands
const ALLOWED_COMMANDS = [
  'info',
  'list-topics',
  'list-facts',
  'facts-by-any-topics',
  'facts-by-all-topics'
];

// Find the KB CLI using the same resolution logic as the skill
function findKbCli() {
  const pluginDir = __dirname;
  const cacheBase = path.join(process.env.HOME, '.claude/plugins/cache/claude-code-knowledge-base');

  // Try plugin bin directory first (versioned plugin cache structure)
  let cliPath = path.join(pluginDir, '..', 'bin', 'claude-kb');

  // Try plugin dist directory (if plugin has its own dist)
  if (!fs.existsSync(cliPath)) {
    const pluginRoot = path.resolve(pluginDir, '..');
    cliPath = path.join(pluginRoot, 'dist', 'cli.js');
  }

  // Fallback to repo root structure (development/repository structure)
  if (!fs.existsSync(cliPath)) {
    const repoRoot = path.resolve(pluginDir, '../../..');
    cliPath = path.join(repoRoot, 'dist', 'cli.js');
  }

  // Try cache versions
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
            if (aPart !== bPart) return bPart - aPart; // Descending order
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

// Validate command and arguments
function validateInput(command, args) {
  if (!ALLOWED_COMMANDS.includes(command)) {
    throw new Error(`Invalid command: ${command}. Allowed commands: ${ALLOWED_COMMANDS.join(', ')}`);
  }

  // Additional validation for specific commands
  switch (command) {
    case 'facts-by-any-topics':
    case 'facts-by-all-topics':
      if (!args || args.trim() === '') {
        throw new Error(`Command ${command} requires topic arguments`);
      }
      // Validate topic names format
      const topics = args.split(',').map(t => t.trim());
      for (const topic of topics) {
        if (topic.length === 0) {
          throw new Error('Empty topic name not allowed');
        }
        if (topic.length > 100) {
          throw new Error(`Topic name too long: ${topic.substring(0, 50)}...`);
        }
        // Check for obvious malformed topics (newlines, excessive punctuation)
        if (/\n|\r/.test(topic)) {
          throw new Error(`Invalid topic name (contains newlines): ${topic.substring(0, 50)}...`);
        }
      }
      break;
  }

  return true;
}

// Execute the KB command
async function executeCommand(command, args = '') {
  return new Promise((resolve, reject) => {
    try {
      validateInput(command, args);
      const cliPath = findKbCli();

      // Build command arguments
      const cmdArgs = [command];
      if (args && args.trim()) {
        cmdArgs.push(args.trim());
      }

      // Determine if we need to use node or execute directly
      const isJsFile = cliPath.endsWith('.js');
      const executable = isJsFile ? 'node' : cliPath;
      const fullArgs = isJsFile ? [cliPath, ...cmdArgs] : cmdArgs;

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
          reject(new Error(`KB command failed (exit code ${code}): ${stderr}`));
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to execute KB command: ${err.message}`));
      });

    } catch (error) {
      reject(error);
    }
  });
}

// Main function for tool execution
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.error('Usage: node kb-query.js <command> [args]');
      console.error(`Allowed commands: ${ALLOWED_COMMANDS.join(', ')}`);
      process.exit(1);
    }

    const command = args[0];
    const commandArgs = args.slice(1).join(' ');

    const result = await executeCommand(command, commandArgs);
    console.log(result);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Export for tool integration
module.exports = {
  metadata: TOOL_METADATA,
  execute: executeCommand
};

// Run as CLI if called directly
if (require.main === module) {
  main();
}