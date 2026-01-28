#!/usr/bin/env node

/**
 * KbSetMetadata Tool - Set knowledge base metadata
 * Restricted to kb-agent use only for secure metadata management
 */

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Tool metadata for Claude Code
const TOOL_METADATA = {
  name: 'KbSetMetadata',
  description: 'Set or update knowledge base metadata (name and description)',
  parameters: {
    name: {
      type: 'string',
      description: 'The name for the knowledge base',
      required: true
    },
    description: {
      type: 'string',
      description: 'Description of what this knowledge base covers',
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

// Validate metadata name
function validateName(name) {
  if (!name || name.trim() === '') {
    throw new Error('Knowledge base name cannot be empty');
  }

  const cleanedName = name.trim();

  if (cleanedName.length > 200) {
    throw new Error('Knowledge base name too long (max 200 characters)');
  }

  // Check for dangerous characters
  if (/[<>"|*?\\/:]/g.test(cleanedName)) {
    throw new Error('Knowledge base name contains invalid characters');
  }

  return cleanedName;
}

// Validate metadata description
function validateDescription(description) {
  if (!description || description.trim() === '') {
    throw new Error('Knowledge base description cannot be empty');
  }

  const cleanedDescription = description.trim();

  if (cleanedDescription.length > 2000) {
    throw new Error('Knowledge base description too long (max 2000 characters)');
  }

  return cleanedDescription;
}

// Execute the set-metadata command
async function executeSetMetadata(name, description) {
  return new Promise((resolve, reject) => {
    try {
      // Validate inputs
      const validName = validateName(name);
      const validDescription = validateDescription(description);

      console.error(`Debug: Setting KB metadata - name: "${validName}"`);

      const cliPath = findKbCli();

      // Build command arguments
      const cmdArgs = ['set-metadata', validName, validDescription];

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
          reject(new Error(`Failed to set metadata (exit code ${code}): ${stderr}`));
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to execute set-metadata: ${err.message}`));
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
      console.error('Usage: node kb-set-metadata.js <name> <description>');
      process.exit(1);
    }

    const name = args[0];
    const description = args[1];

    const result = await executeSetMetadata(name, description);
    console.log(result);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Export for tool integration
module.exports = {
  metadata: TOOL_METADATA,
  execute: executeSetMetadata
};

// Run as CLI if called directly
if (require.main === module) {
  main();
}