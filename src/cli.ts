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
      console.log(JSON.stringify(results, null, 2));
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
      console.log(JSON.stringify(facts, null, 2));
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
      console.log(JSON.stringify(facts, null, 2));
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
      console.log(JSON.stringify(fact, null, 2));
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

    // Legacy command support (backward compatibility)
    case 'list-tags': {
      console.log('Note: "list-tags" is deprecated, use "list-topics" instead');
      const topics = kb.getAllTopics();
      console.log(JSON.stringify(topics, null, 2));
      break;
    }

    case 'facts-by-tag': {
      console.log('Note: "facts-by-tag" is deprecated, use "facts-by-topic" instead');
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
      console.log(JSON.stringify(facts, null, 2));
      break;
    }

    case 'add-tag': {
      console.log('Note: "add-tag" is deprecated, use "add-topic" instead');
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

    default:
      console.error(`Unknown command: ${command}`);
  }
}

if (require.main === module) {
  main();
}