#!/usr/bin/env node

// Test script for the KnowledgeAgent
const { createKnowledgeAgent } = require('./dist/index');

async function testKnowledgeAgent() {
  console.log('🧪 Testing KnowledgeAgent with existing knowledge base...\n');

  // Create agent using our existing KB
  const agent = createKnowledgeAgent('./kb');

  console.log('📊 Knowledge Base Analysis:');
  console.log('=' .repeat(50));

  const analysis = await agent.analyzeKnowledge();
  console.log('Stats:', JSON.stringify(analysis.stats, null, 2));

  if (analysis.organizationSuggestions.length > 0) {
    console.log('\n💡 Organization Suggestions:');
    analysis.organizationSuggestions.forEach((suggestion, i) => {
      console.log(`${i + 1}. ${suggestion}`);
    });
  } else {
    console.log('\n✅ No organization suggestions - knowledge base looks well organized!');
  }

  console.log('\n🔍 Testing Natural Language Queries:');
  console.log('=' .repeat(50));

  // Test queries
  const queries = [
    'jiu jitsu',
    'what activities does Austin do?',
    'Brooklyn fashion',
    'Santa Claus beliefs',
    'tournaments',
    'Mill Valley address'
  ];

  for (const query of queries) {
    console.log(`\nQuery: "${query}"`);
    console.log('-'.repeat(30));

    const result = await agent.processQuery(query);
    console.log(`Summary: ${result.summary}`);

    if (result.relevantFacts.length > 0) {
      console.log(`Facts found: ${result.relevantFacts.length}`);
      result.relevantFacts.forEach((fact, i) => {
        console.log(`  ${i + 1}. [ID:${fact.id}] ${fact.content}`);
        if (fact.topics.size > 0) {
          console.log(`     Topics: ${Array.from(fact.topics).join(', ')}`);
        }
      });
    }

    if (result.suggestedTopics.length > 0) {
      console.log(`Suggested topics: ${result.suggestedTopics.join(', ')}`);
    }
  }

  console.log('\n🆕 Testing Knowledge Addition with Conflict Detection:');
  console.log('=' .repeat(50));

  // Test adding knowledge that might conflict
  const testAdditions = [
    {
      content: 'Austin takes jiu jitsu lessons at Bay Jiu Jitsu on Miller Ave', // Duplicate
      topics: ['austin', 'sports']
    },
    {
      content: 'Austin does not believe in Santa Claus', // Contradiction
      topics: ['austin', 'beliefs']
    },
    {
      content: 'Brooklyn and Austin love playing video games together', // New info
      topics: ['twins', 'gaming']
    }
  ];

  for (const addition of testAdditions) {
    console.log(`\nTesting addition: "${addition.content}"`);
    console.log('-'.repeat(30));

    const result = await agent.addKnowledge(
      addition.content,
      addition.topics,
      ['Test source']
    );

    console.log(`Conflicts detected: ${result.conflicts.length}`);
    if (result.conflicts.length > 0) {
      result.conflicts.forEach((conflict, i) => {
        console.log(`  ${i + 1}. ${conflict.type}: ${conflict.description}`);
        console.log(`     Conflicts with fact ${conflict.conflictingFact.id}: "${conflict.conflictingFact.content}"`);
      });
    }

    if (result.addedFact) {
      console.log(`✅ Added successfully as fact ID: ${result.addedFact.id}`);
    }

    if (result.suggestions.length > 0) {
      console.log('Suggestions:');
      result.suggestions.forEach((suggestion, i) => {
        console.log(`  ${i + 1}. ${suggestion}`);
      });
    }
  }

  console.log('\n🎉 KnowledgeAgent testing complete!');
}

// Run the test
testKnowledgeAgent().catch(console.error);