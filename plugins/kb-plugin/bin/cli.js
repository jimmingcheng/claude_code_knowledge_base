#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const kbPath = process.env.KB_PATH || './kb';
// Helper function to parse and validate comma-separated topic names
function parseTopicNames(topicsArg) {
    if (!topicsArg) {
        console.error('Please provide topic names (comma-separated)');
        return null;
    }
    const topicNames = topicsArg.split(',').map(t => t.trim()).filter(t => t.length > 0);
    if (topicNames.length === 0) {
        console.error('Please provide at least one valid topic name');
        return null;
    }
    return topicNames;
}
// Helper function to parse boolean arguments
function parseBoolean(value, fieldName) {
    if (!value)
        return null;
    const lower = value.toLowerCase();
    if (lower === 'true')
        return true;
    if (lower === 'false')
        return false;
    console.error(`${fieldName} must be "true" or "false"`);
    return null;
}
// Helper function for persistent topic protection error
function showPersistentTopicError(topicName, operation) {
    console.error(`Cannot ${operation} persistent topic "${topicName}".`);
    console.error('Persistent topics are protected from automatic modification.');
    console.error('Use "set-topic-persistence" to change protection status first.');
}
function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    if (!command) {
        console.log('Usage: claude-kb <command> [args...]');
        console.log('');
        console.log('First-time setup (REQUIRED):');
        console.log('  set-metadata <name> <description> - Initialize knowledge base metadata');
        console.log('');
        console.log('Query commands:');
        console.log('  info                  - Show knowledge base metadata and statistics');
        console.log('  stats                 - Show knowledge base statistics');
        console.log('  list-topics           - List all topics');
        console.log('  list-facts            - List all facts');
        console.log('  list-sources          - List all sources');
        console.log('  get-source <id>       - Get a single source by ID');
        console.log('  facts-by-any-topics <topic1,topic2,...> - Get facts matching ANY of the specified topics (OR logic)');
        console.log('  facts-by-all-topics <topic1,topic2,...> - Get facts matching ALL of the specified topics (AND logic)');
        console.log('');
        console.log('Content management (requires metadata initialization):');
        console.log('  add-fact <content> [topic1,topic2,...] [sourceId1,sourceId2,...]');
        console.log('  add-topic <name> <description> [isPersistent]');
        console.log('  add-source <type> <title> [url]  - Add a source (type: person|url)');
        console.log('');
        console.log('CRUD Operations:');
        console.log('  update-fact <id> <content> [topic1,topic2,...] [sourceId1,sourceId2,...]');
        console.log('  remove-fact <id>      - Remove a fact by ID');
        console.log('  remove-source <id>    - Remove a source by ID');
        console.log('  update-topic <name> <description> - Update topic description');
        console.log('  remove-topic <name>   - Remove a topic');
        console.log('');
        console.log('Topic Management:');
        console.log('  merge-topics <source> <target> - Merge source topic into target');
        console.log('  rename-topic <old> <new>       - Rename a topic');
        console.log('  set-topic-persistence <name> <true|false> - Change topic persistence status');
        console.log('');
        console.log('Staged Changes:');
        console.log("  stage-changes '<json>'         - Write staged changes from JSON input");
        console.log('  list-staged                    - Output current staged changes as JSON');
        console.log('  format-staged                  - Output formatted markdown summary of staged changes');
        console.log('  apply-staged all               - Apply all staged changes');
        console.log('  apply-staged <id1,id2,...>      - Apply selected staged changes');
        console.log('  reject-staged all              - Reject all staged changes');
        console.log('  reject-staged <id1,id2,...>     - Reject selected staged changes');
        console.log('  clear-staged                   - Clear all staged changes (alias for reject-staged all)');
        return;
    }
    const kb = (0, index_1.createKnowledgeBase)(kbPath);
    switch (command) {
        case 'info': {
            const metadata = kb.getMetadata();
            const stats = kb.getStats();
            console.log('=== Knowledge Base Information ===');
            if (metadata) {
                console.log(`Name: ${metadata.name}`);
                console.log(`Description: ${metadata.description}`);
            }
            else {
                console.log('No metadata found (kb.json missing)');
                console.log('Use "set-metadata <name> <description>" to initialize');
            }
            console.log('');
            console.log('Statistics:');
            console.log(`  Topics: ${stats.totalTopics}`);
            console.log(`  Facts: ${stats.totalFacts}`);
            console.log(`  Sources: ${stats.totalSources}`);
            console.log(`  Average topics per fact: ${stats.averageTopicsPerFact}`);
            break;
        }
        case 'set-metadata': {
            const name = args[1];
            const description = args[2];
            if (!name || !description) {
                console.error('Please provide both name and description');
                console.error('Usage: claude-kb set-metadata <name> <description>');
                return;
            }
            const metadata = kb.setMetadata(name, description);
            console.log('Knowledge base metadata updated:');
            console.log(`Name: ${metadata.name}`);
            console.log(`Description: ${metadata.description}`);
            break;
        }
        case 'stats': {
            const stats = kb.getStats();
            console.log(JSON.stringify(stats, null, 2));
            break;
        }
        case 'list-topics': {
            const topics = kb.getAllTopics();
            console.log(JSON.stringify(topics.map(t => t.toObject()), null, 2));
            break;
        }
        case 'list-facts': {
            const facts = kb.getAllFacts();
            console.log(JSON.stringify(facts.map(f => f.toObject()), null, 2));
            break;
        }
        case 'list-sources': {
            const sources = kb.getAllSources();
            console.log(JSON.stringify(sources.map(s => s.toObject()), null, 2));
            break;
        }
        case 'get-source': {
            const id = parseInt(args[1]);
            if (!id || isNaN(id)) {
                console.error('Please provide a valid source ID');
                return;
            }
            const source = kb.findSourceById(id);
            if (source) {
                console.log(JSON.stringify(source.toObject(), null, 2));
            }
            else {
                console.error(`Source with ID ${id} not found`);
            }
            break;
        }
        case 'facts-by-any-topics': {
            const topicNames = parseTopicNames(args[1]);
            if (!topicNames)
                return;
            const facts = kb.getFactsByTopicNames(topicNames);
            if (facts.length === 0) {
                console.log(`No facts found for topics (OR): ${topicNames.join(', ')}`);
                return;
            }
            console.log(JSON.stringify(facts.map(f => f.toObject()), null, 2));
            break;
        }
        case 'facts-by-all-topics': {
            const topicNames = parseTopicNames(args[1]);
            if (!topicNames)
                return;
            const facts = kb.getFactsByAllTopicNames(topicNames);
            if (facts.length === 0) {
                console.log(`No facts found for topics (AND): ${topicNames.join(', ')}`);
                return;
            }
            console.log(JSON.stringify(facts.map(f => f.toObject()), null, 2));
            break;
        }
        case 'add-fact': {
            // Check if metadata exists before allowing fact creation
            if (!kb.hasMetadata()) {
                console.error('ERROR: Knowledge base metadata not initialized.');
                console.error('You must run "claude-kb set-metadata <name> <description>" first.');
                console.error('');
                console.error('This command requires user input and cannot be run autonomously.');
                process.exit(1);
            }
            const content = args[1];
            const topicNames = args[2] ? args[2].split(',').map(t => t.trim()) : [];
            const sourceIds = args[3] ? args[3].split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];
            if (!content) {
                console.error('Please provide fact content');
                return;
            }
            const fact = kb.createFact(content, new Set(topicNames), new Set(sourceIds));
            console.log(`Created fact with ID: ${fact.id}`);
            console.log(JSON.stringify(fact.toObject(), null, 2));
            break;
        }
        case 'add-topic': {
            // Check if metadata exists before allowing topic creation
            if (!kb.hasMetadata()) {
                console.error('ERROR: Knowledge base metadata not initialized.');
                console.error('You must run "claude-kb set-metadata <name> <description>" first.');
                console.error('');
                console.error('This command requires user input and cannot be run autonomously.');
                process.exit(1);
            }
            const name = args[1];
            const description = args[2] || '';
            const isPersistentArg = args[3];
            if (!name) {
                console.error('Please provide topic name');
                return;
            }
            // Parse isPersistent parameter (defaults to false for auto-created topics)
            const isPersistent = parseBoolean(args[3], 'isPersistent') ?? false;
            const topic = kb.createTopic(name, description, isPersistent);
            console.log(`Created topic: ${topic.name}${topic.isPersistent ? ' [persistent]' : ''}`);
            console.log(JSON.stringify(topic.toObject(), null, 2));
            break;
        }
        case 'add-source': {
            // Check if metadata exists before allowing source creation
            if (!kb.hasMetadata()) {
                console.error('ERROR: Knowledge base metadata not initialized.');
                console.error('You must run "claude-kb set-metadata <name> <description>" first.');
                process.exit(1);
            }
            const type = args[1];
            const title = args[2];
            const url = args[3];
            if (!type || (type !== 'person' && type !== 'url')) {
                console.error('Please provide a valid source type (person or url)');
                console.error('Usage: claude-kb add-source <type> <title> [url]');
                return;
            }
            if (!title) {
                console.error('Please provide source title');
                return;
            }
            if (type === 'url' && !url) {
                console.error('URL is required for url-type sources');
                return;
            }
            const source = kb.createSource(type, title, url);
            console.log(`Created source with ID: ${source.id}`);
            console.log(JSON.stringify(source.toObject(), null, 2));
            break;
        }
        case 'remove-source': {
            const id = parseInt(args[1]);
            if (!id || isNaN(id)) {
                console.error('Please provide a valid source ID');
                return;
            }
            const success = kb.removeSourceById(id);
            if (success) {
                console.log(`Removed source with ID: ${id}`);
            }
            else {
                console.error(`Source with ID ${id} not found`);
            }
            break;
        }
        // CRUD Operations
        case 'update-fact': {
            // Check if metadata exists before allowing fact updates
            if (!kb.hasMetadata()) {
                console.error('ERROR: Knowledge base metadata not initialized.');
                console.error('You must run "claude-kb set-metadata <name> <description>" first.');
                process.exit(1);
            }
            const id = parseInt(args[1]);
            const content = args[2];
            const topicNames = args[3] ? args[3].split(',').map(t => t.trim()) : [];
            const sourceIds = args[4] ? args[4].split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : [];
            if (!id || isNaN(id)) {
                console.error('Please provide a valid fact ID');
                return;
            }
            if (!content) {
                console.error('Please provide fact content');
                return;
            }
            const updatedFact = kb.updateFact(id, content, new Set(topicNames), new Set(sourceIds));
            if (updatedFact) {
                console.log(`Updated fact with ID: ${updatedFact.id}`);
                console.log(JSON.stringify(updatedFact.toObject(), null, 2));
            }
            else {
                console.error(`Fact with ID ${id} not found`);
            }
            break;
        }
        case 'remove-fact': {
            const id = parseInt(args[1]);
            if (!id || isNaN(id)) {
                console.error('Please provide a valid fact ID');
                return;
            }
            const success = kb.removeFactById(id);
            if (success) {
                console.log(`Removed fact with ID: ${id}`);
            }
            else {
                console.error(`Fact with ID ${id} not found`);
            }
            break;
        }
        case 'update-topic': {
            const name = args[1];
            const description = args[2];
            if (!name) {
                console.error('Please provide topic name');
                return;
            }
            if (!description) {
                console.error('Please provide topic description');
                return;
            }
            const updatedTopic = kb.updateTopic(name, description);
            if (updatedTopic) {
                console.log(`Updated topic: ${updatedTopic.name}`);
                console.log(JSON.stringify(updatedTopic.toObject(), null, 2));
            }
            else {
                console.error(`Topic "${name}" not found`);
            }
            break;
        }
        case 'remove-topic': {
            const name = args[1];
            if (!name) {
                console.error('Please provide topic name');
                return;
            }
            // Check if topic is persistent before removing
            const topic = kb.findTopicByName(name);
            if (topic && topic.isPersistent) {
                showPersistentTopicError(name, 'remove');
                process.exit(1);
            }
            const success = kb.removeTopicByName(name);
            if (success) {
                console.log(`Removed topic: ${name}`);
            }
            else {
                console.error(`Topic "${name}" not found`);
            }
            break;
        }
        // Topic Management
        case 'merge-topics': {
            const sourceTopicName = args[1];
            const targetTopicName = args[2];
            if (!sourceTopicName || !targetTopicName) {
                console.error('Please provide both source and target topic names');
                return;
            }
            // Check if either topic is persistent before merging
            const sourceTopic = kb.findTopicByName(sourceTopicName);
            const targetTopic = kb.findTopicByName(targetTopicName);
            if (sourceTopic && sourceTopic.isPersistent) {
                showPersistentTopicError(sourceTopicName, 'merge from');
                console.error('Consider merging into the persistent topic instead.');
                process.exit(1);
            }
            if (targetTopic && targetTopic.isPersistent) {
                console.log(`Merging into persistent topic "${targetTopicName}".`);
                console.log('Note: The target topic is user-created and will be preserved.');
            }
            const success = kb.mergeTopics(sourceTopicName, targetTopicName);
            if (success) {
                console.log(`Merged topic "${sourceTopicName}" into "${targetTopicName}"`);
                console.log('All facts updated and source topic removed');
            }
            else {
                console.error(`Could not merge topics. Make sure both "${sourceTopicName}" and "${targetTopicName}" exist`);
            }
            break;
        }
        case 'rename-topic': {
            const oldName = args[1];
            const newName = args[2];
            if (!oldName || !newName) {
                console.error('Please provide both old and new topic names');
                return;
            }
            // Check if topic is persistent before renaming
            const oldTopic = kb.findTopicByName(oldName);
            if (oldTopic && oldTopic.isPersistent) {
                showPersistentTopicError(oldName, 'rename');
                process.exit(1);
            }
            const success = kb.renameTopic(oldName, newName);
            if (success) {
                console.log(`Renamed topic "${oldName}" to "${newName}"`);
                console.log('All facts updated');
            }
            else {
                console.error(`Could not rename topic. Make sure "${oldName}" exists and "${newName}" doesn't already exist`);
            }
            break;
        }
        case 'set-topic-persistence': {
            const topicName = args[1];
            if (!topicName) {
                console.error('Please provide topic name');
                return;
            }
            const isPersistent = parseBoolean(args[2], 'Persistence status');
            if (isPersistent === null) {
                console.error('Please provide persistence status (true or false)');
                return;
            }
            // Check if topic exists before attempting update
            const topic = kb.findTopicByName(topicName);
            if (!topic) {
                console.error(`Topic "${topicName}" not found`);
                return;
            }
            const success = kb.setTopicPersistence(topicName, isPersistent);
            if (success) {
                const statusText = isPersistent ? 'persistent' : 'non-persistent';
                const protectionText = isPersistent
                    ? 'This topic is now protected from automatic modification.'
                    : 'This topic can now be automatically reorganized.';
                console.log(`Changed topic "${topicName}" to ${statusText}`);
                console.log(protectionText);
            }
            else {
                console.error(`Failed to update topic "${topicName}"`);
            }
            break;
        }
        // Staged Changes Commands
        case 'stage-changes': {
            const jsonInput = args[1];
            if (!jsonInput) {
                console.error('Please provide staged changes JSON');
                console.error("Usage: claude-kb stage-changes '<json>'");
                process.exit(1);
            }
            let staged;
            try {
                staged = JSON.parse(jsonInput);
            }
            catch (error) {
                console.error('Invalid JSON input:', error instanceof Error ? error.message : String(error));
                process.exit(1);
                return; // TypeScript flow
            }
            if (!staged.stagedAt || !staged.summary || !Array.isArray(staged.changes)) {
                console.error('Invalid staged changes format: must have stagedAt, summary, and changes array');
                process.exit(1);
            }
            kb.saveStagedChanges(staged);
            console.log(`Staged ${staged.changes.length} change(s)`);
            console.log(`Summary: ${staged.summary}`);
            break;
        }
        case 'list-staged': {
            const staged = kb.loadStagedChanges();
            if (!staged) {
                console.log('No staged changes');
                break;
            }
            console.log(JSON.stringify(staged, null, 2));
            break;
        }
        case 'format-staged': {
            const staged = kb.loadStagedChanges();
            if (!staged) {
                console.log('No staged changes');
                break;
            }
            // Group changes by category
            const factOps = new Set(['add-fact', 'update-fact', 'remove-fact']);
            const topicOps = new Set(['add-topic', 'update-topic', 'remove-topic', 'merge-topics', 'rename-topic', 'set-topic-persistence']);
            const sourceOps = new Set(['add-source', 'remove-source']);
            const factChanges = staged.changes.filter(c => factOps.has(c.operation));
            const topicChanges = staged.changes.filter(c => topicOps.has(c.operation));
            const sourceChanges = staged.changes.filter(c => sourceOps.has(c.operation));
            const otherChanges = staged.changes.filter(c => !factOps.has(c.operation) && !topicOps.has(c.operation) && !sourceOps.has(c.operation));
            // Escape pipe characters in table cell values
            const esc = (s) => s.replace(/\|/g, '\\|');
            // Header line
            console.log(`Staged ${staged.changes.length} change(s) — ${staged.summary}`);
            // Fact changes table
            if (factChanges.length > 0) {
                console.log('');
                console.log('**Fact Changes:**');
                console.log('');
                console.log('| # | Operation | Content | Topics | Reason |');
                console.log('|---|-----------|---------|--------|--------|');
                for (const c of factChanges) {
                    const p = c.params;
                    const content = esc(String(p.content || c.description));
                    const topics = Array.isArray(p.topics) ? p.topics.join(', ') : '';
                    const reason = c.stagingReasons.join(', ');
                    console.log(`| ${c.id} | ${c.operation} | ${esc(content)} | ${esc(topics)} | ${esc(reason)} |`);
                }
            }
            // Topic changes table
            if (topicChanges.length > 0) {
                console.log('');
                console.log('**Topic Changes:**');
                console.log('');
                console.log('| # | Operation | Description | Reason |');
                console.log('|---|-----------|-------------|--------|');
                for (const c of topicChanges) {
                    const reason = c.stagingReasons.join(', ');
                    console.log(`| ${c.id} | ${c.operation} | ${esc(c.description)} | ${esc(reason)} |`);
                }
            }
            // Source changes table
            if (sourceChanges.length > 0) {
                console.log('');
                console.log('**Source Changes:**');
                console.log('');
                console.log('| # | Operation | Type | Title | Reason |');
                console.log('|---|-----------|------|-------|--------|');
                for (const c of sourceChanges) {
                    const p = c.params;
                    const type = esc(String(p.type || ''));
                    const title = esc(String(p.title || ''));
                    const reason = c.stagingReasons.join(', ');
                    console.log(`| ${c.id} | ${c.operation} | ${type} | ${title} | ${esc(reason)} |`);
                }
            }
            // Other changes table
            if (otherChanges.length > 0) {
                console.log('');
                console.log('**Other Changes:**');
                console.log('');
                console.log('| # | Operation | Description | Reason |');
                console.log('|---|-----------|-------------|--------|');
                for (const c of otherChanges) {
                    const reason = c.stagingReasons.join(', ');
                    console.log(`| ${c.id} | ${c.operation} | ${esc(c.description)} | ${esc(reason)} |`);
                }
            }
            // Conflict details
            const changesWithConflicts = staged.changes.filter(c => c.conflicts && c.conflicts.length > 0);
            if (changesWithConflicts.length > 0) {
                console.log('');
                console.log('**Conflicts detected:**');
                for (const c of changesWithConflicts) {
                    for (const conflict of c.conflicts) {
                        console.log(`- Change #${c.id} conflicts with existing fact #${conflict.existingFactId}: "${conflict.existingFactContent}"`);
                        const p = c.params;
                        if (p.content) {
                            console.log(`  New: "${p.content}"`);
                        }
                        console.log(`  Reason: ${conflict.conflictDescription}`);
                    }
                }
            }
            break;
        }
        case 'apply-staged': {
            const staged = kb.loadStagedChanges();
            if (!staged) {
                console.error('No staged changes to apply');
                process.exit(1);
            }
            const selector = args[1];
            if (!selector) {
                console.error('Please specify "all" or comma-separated IDs');
                console.error('Usage: claude-kb apply-staged all');
                console.error('       claude-kb apply-staged 1,2,3');
                process.exit(1);
            }
            // Shared batch context for refId -> actualId mapping
            const context = { sourceIdMap: new Map() };
            if (selector === 'all') {
                // Apply all changes
                const results = [];
                for (const change of staged.changes) {
                    results.push(kb.applyStagedChange(change, context));
                }
                kb.clearStagedChanges();
                console.log(`Applied ${staged.changes.length} change(s):`);
                results.forEach(r => console.log(`  ${r}`));
            }
            else {
                // Apply selected changes by ID
                const ids = selector.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                if (ids.length === 0) {
                    console.error('Please provide valid change IDs');
                    process.exit(1);
                }
                const toApply = staged.changes.filter(c => ids.includes(c.id));
                const remaining = staged.changes.filter(c => !ids.includes(c.id));
                if (toApply.length === 0) {
                    console.error(`No staged changes found with IDs: ${ids.join(', ')}`);
                    process.exit(1);
                }
                const results = [];
                for (const change of toApply) {
                    results.push(kb.applyStagedChange(change, context));
                }
                if (remaining.length > 0) {
                    kb.saveStagedChanges({
                        ...staged,
                        changes: remaining,
                    });
                    console.log(`Applied ${toApply.length} change(s), ${remaining.length} remaining:`);
                }
                else {
                    kb.clearStagedChanges();
                    console.log(`Applied ${toApply.length} change(s):`);
                }
                results.forEach(r => console.log(`  ${r}`));
            }
            break;
        }
        case 'reject-staged':
        case 'clear-staged': {
            const staged = kb.loadStagedChanges();
            if (!staged) {
                console.log('No staged changes to clear');
                break;
            }
            const selector = command === 'clear-staged' ? 'all' : args[1];
            if (!selector) {
                console.error('Please specify "all" or comma-separated IDs');
                console.error('Usage: claude-kb reject-staged all');
                console.error('       claude-kb reject-staged 1,2,3');
                process.exit(1);
            }
            if (selector === 'all') {
                kb.clearStagedChanges();
                console.log(`Rejected ${staged.changes.length} staged change(s)`);
            }
            else {
                const ids = selector.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                if (ids.length === 0) {
                    console.error('Please provide valid change IDs');
                    process.exit(1);
                }
                const toReject = staged.changes.filter(c => ids.includes(c.id));
                const remaining = staged.changes.filter(c => !ids.includes(c.id));
                if (toReject.length === 0) {
                    console.error(`No staged changes found with IDs: ${ids.join(', ')}`);
                    process.exit(1);
                }
                if (remaining.length > 0) {
                    kb.saveStagedChanges({
                        ...staged,
                        changes: remaining,
                    });
                    console.log(`Rejected ${toReject.length} change(s), ${remaining.length} remaining`);
                }
                else {
                    kb.clearStagedChanges();
                    console.log(`Rejected ${toReject.length} change(s)`);
                }
            }
            break;
        }
        default:
            console.error(`Unknown command: ${command}`);
            process.exit(1);
    }
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=cli.js.map