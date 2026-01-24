#!/usr/bin/env node
import { createKnowledgeBase } from './index';

const kbPath = process.env.KB_PATH || './kb';

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('Usage: claude-kb <command> [args...]');
    console.log('Commands:');
    console.log('  search <query>        - Search facts by content');
    console.log('  stats                 - Show knowledge base statistics');
    console.log('  list-topics           - List all topics');
    console.log('  list-facts            - List all facts');
    console.log('  facts-by-topic <topic> - Get facts with specific topic name');
    console.log('  add-fact <content> [topic1,topic2,...] [source1,source2,...]');
    console.log('  add-topic <name> <description>');
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
    return;
  }

  const kb = createKnowledgeBase(kbPath);

  switch (command) {
    case 'search': {
      const query = args[1];
      if (!query) {
        console.error('Please provide a search query');
        return;
      }
      const results = kb.searchFactsByContent(query);
      console.log(JSON.stringify(results.map(f => f.toObject()), null, 2));
      break;
    }

    case 'stats': {
      const stats = kb.getStats();
      console.log(JSON.stringify(stats, null, 2));
      break;
    }

    case 'list-topics': {
      const topics = kb.getAllTopics();
      console.log(JSON.stringify(topics, null, 2));
      break;
    }

    case 'list-facts': {
      const facts = kb.getAllFacts();
      console.log(JSON.stringify(facts.map(f => f.toObject()), null, 2));
      break;
    }

    case 'facts-by-topic': {
      const topicName = args[1];
      if (!topicName) {
        console.error('Please provide a topic name');
        return;
      }
      const facts = kb.getFactsByTopicNames([topicName]);
      if (facts.length === 0) {
        console.log(`No facts found for topic "${topicName}"`);
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

      if (!name) {
        console.error('Please provide topic name');
        return;
      }

      const topic = kb.createTopic(name, description);
      console.log(`Created topic: ${topic.name}`);
      console.log(JSON.stringify(topic, null, 2));
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

      const success = kb.renameTopic(oldName, newName);
      if (success) {
        console.log(`Renamed topic "${oldName}" to "${newName}"`);
        console.log('All facts updated');
      } else {
        console.error(`Could not rename topic. Make sure "${oldName}" exists and "${newName}" doesn't already exist`);
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