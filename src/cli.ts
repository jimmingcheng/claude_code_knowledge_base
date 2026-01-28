#!/usr/bin/env node
import { createKnowledgeBase } from './index';

const kbPath = process.env.KB_PATH || './kb';

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('Usage: claude-kb <command> [args...]');
    console.log('Commands:');
    console.log('  info                  - Show knowledge base metadata and statistics');
    console.log('  set-metadata <name> <description> - Set or update knowledge base metadata');
    console.log('  stats                 - Show knowledge base statistics');
    console.log('  list-topics           - List all topics');
    console.log('  list-facts            - List all facts');
    console.log('  facts-by-any-topics <topic1,topic2,...> - Get facts matching ANY of the specified topics (OR logic)');
    console.log('  facts-by-all-topics <topic1,topic2,...> - Get facts matching ALL of the specified topics (AND logic)');
    console.log('  add-fact <content> [topic1,topic2,...] [source1,source2,...]');
    console.log('  add-topic <name> <description> [isPersistent]');
    console.log('');
    console.log('CRUD Operations:');
    console.log('  update-fact <id> <content> [topic1,topic2,...] [source1,source2,...]');
    console.log('  remove-fact <id>      - Remove a fact by ID');
    console.log('  update-topic <name> <description> - Update topic description');
    console.log('  remove-topic <name>   - Remove a topic');
    console.log('');
    console.log('Topic Management:');
    console.log('  merge-topics <source> <target> - Merge source topic into target');
    console.log('  rename-topic <old> <new>       - Rename a topic');
    console.log('  set-topic-persistence <name> <true|false> - Change topic persistence status');
    return;
  }

  const kb = createKnowledgeBase(kbPath);

  switch (command) {
    case 'info': {
      const metadata = kb.getMetadata();
      const stats = kb.getStats();

      console.log('=== Knowledge Base Information ===');
      if (metadata) {
        console.log(`Name: ${metadata.name}`);
        console.log(`Description: ${metadata.description}`);
      } else {
        console.log('No metadata found (kb.json missing)');
        console.log('Use "set-metadata <name> <description>" to initialize');
      }
      console.log('');
      console.log('Statistics:');
      console.log(`  Topics: ${stats.totalTopics}`);
      console.log(`  Facts: ${stats.totalFacts}`);
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

    case 'facts-by-any-topics': {
      const topicsArg = args[1];
      if (!topicsArg) {
        console.error('Please provide topic names (comma-separated)');
        return;
      }
      const topicNames = topicsArg.split(',').map(t => t.trim()).filter(t => t.length > 0);
      if (topicNames.length === 0) {
        console.error('Please provide at least one valid topic name');
        return;
      }
      const facts = kb.getFactsByTopicNames(topicNames);
      if (facts.length === 0) {
        console.log(`No facts found for topics (OR): ${topicNames.join(', ')}`);
        return;
      }
      console.log(JSON.stringify(facts.map(f => f.toObject()), null, 2));
      break;
    }

    case 'facts-by-all-topics': {
      const topicsArg = args[1];
      if (!topicsArg) {
        console.error('Please provide topic names (comma-separated)');
        return;
      }
      const topicNames = topicsArg.split(',').map(t => t.trim()).filter(t => t.length > 0);
      if (topicNames.length === 0) {
        console.error('Please provide at least one valid topic name');
        return;
      }
      const facts = kb.getFactsByAllTopicNames(topicNames);
      if (facts.length === 0) {
        console.log(`No facts found for topics (AND): ${topicNames.join(', ')}`);
        return;
      }
      console.log(JSON.stringify(facts.map(f => f.toObject()), null, 2));
      break;
    }

    // Backward compatibility: redirect old command to new one
    case 'facts-by-topics': {
      console.warn('Warning: "facts-by-topics" is deprecated. Use "facts-by-any-topics" for OR logic or "facts-by-all-topics" for AND logic.');
      const topicsArg = args[1];
      if (!topicsArg) {
        console.error('Please provide topic names (comma-separated)');
        return;
      }
      const topicNames = topicsArg.split(',').map(t => t.trim()).filter(t => t.length > 0);
      if (topicNames.length === 0) {
        console.error('Please provide at least one valid topic name');
        return;
      }
      const facts = kb.getFactsByTopicNames(topicNames);
      if (facts.length === 0) {
        console.log(`No facts found for topics (OR): ${topicNames.join(', ')}`);
        return;
      }
      console.log(JSON.stringify(facts.map(f => f.toObject()), null, 2));
      break;
    }

    case 'add-fact': {
      const content = args[1];
      const topicNames = args[2] ? args[2].split(',').map(t => t.trim()) : [];
      const sources = args[3] ? args[3].split(',').map(s => s.trim()) : [];

      if (!content) {
        console.error('Please provide fact content');
        return;
      }

      const fact = kb.createFact(content, new Set(topicNames), new Set(sources));
      console.log(`Created fact with ID: ${fact.id}`);
      console.log(JSON.stringify(fact.toObject(), null, 2));
      break;
    }

    case 'add-topic': {
      const name = args[1];
      const description = args[2] || '';
      const isPersistentArg = args[3];

      if (!name) {
        console.error('Please provide topic name');
        return;
      }

      // Parse isPersistent parameter (defaults to false for auto-created topics)
      let isPersistent = false;
      if (isPersistentArg !== undefined) {
        isPersistent = isPersistentArg.toLowerCase() === 'true';
      }

      const topic = kb.createTopic(name, description, isPersistent);
      console.log(`Created topic: ${topic.name}${topic.isPersistent ? ' [persistent]' : ''}`);
      console.log(JSON.stringify(topic.toObject(), null, 2));
      break;
    }

    // CRUD Operations
    case 'update-fact': {
      const id = parseInt(args[1]);
      const content = args[2];
      const topicNames = args[3] ? args[3].split(',').map(t => t.trim()) : [];
      const sources = args[4] ? args[4].split(',').map(s => s.trim()) : [];

      if (!id || isNaN(id)) {
        console.error('Please provide a valid fact ID');
        return;
      }
      if (!content) {
        console.error('Please provide fact content');
        return;
      }

      const updatedFact = kb.updateFact(id, content, new Set(topicNames), new Set(sources));
      if (updatedFact) {
        console.log(`Updated fact with ID: ${updatedFact.id}`);
        console.log(JSON.stringify(updatedFact.toObject(), null, 2));
      } else {
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
      } else {
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
      } else {
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
        console.error(`Cannot remove persistent topic "${name}".`);
        console.error('Persistent topics are user-created and protected from automatic modification.');
        console.error('If you really want to remove this topic, you must do so explicitly with intention.');
        return;
      }

      const success = kb.removeTopicByName(name);
      if (success) {
        console.log(`Removed topic: ${name}`);
      } else {
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
        console.error(`Cannot merge persistent topic "${sourceTopicName}".`);
        console.error('Persistent topics are user-created and protected from automatic modification.');
        console.error('Consider merging into the persistent topic instead, or ask the user for explicit permission.');
        return;
      }

      if (targetTopic && targetTopic.isPersistent) {
        console.log(`Merging into persistent topic "${targetTopicName}".`);
        console.log('Note: The target topic is user-created and will be preserved.');
      }

      const success = kb.mergeTopics(sourceTopicName, targetTopicName);
      if (success) {
        console.log(`Merged topic "${sourceTopicName}" into "${targetTopicName}"`);
        console.log('All facts updated and source topic removed');
      } else {
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
        console.error(`Cannot rename persistent topic "${oldName}".`);
        console.error('Persistent topics are user-created and protected from automatic modification.');
        console.error('If you want to rename this topic, ask the user for explicit permission first.');
        return;
      }

      const success = kb.renameTopic(oldName, newName);
      if (success) {
        console.log(`Renamed topic "${oldName}" to "${newName}"`);
        console.log('All facts updated');
      } else {
        console.error(`Could not rename topic. Make sure "${oldName}" exists and "${newName}" doesn't already exist`);
      }
      break;
    }

    case 'set-topic-persistence': {
      const topicName = args[1];
      const isPersistentArg = args[2];

      if (!topicName) {
        console.error('Please provide topic name');
        return;
      }
      if (!isPersistentArg) {
        console.error('Please provide persistence status (true or false)');
        return;
      }

      // Parse isPersistent parameter
      const isPersistent = isPersistentArg.toLowerCase() === 'true';
      if (isPersistentArg.toLowerCase() !== 'true' && isPersistentArg.toLowerCase() !== 'false') {
        console.error('Persistence status must be "true" or "false"');
        return;
      }

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
      } else {
        console.error(`Failed to update topic "${topicName}"`);
      }
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
  }
}

if (require.main === module) {
  main();
}