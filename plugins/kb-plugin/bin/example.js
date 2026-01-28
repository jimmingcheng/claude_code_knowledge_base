"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
/**
 * Example usage of the Knowledge Base system.
 */
function main() {
    console.log('Claude Code Knowledge Base - TypeScript Example');
    console.log('='.repeat(50));
    // Create or load a knowledge base (this will create a temporary demo directory)
    const kbPath = './demo_kb';
    const kb = (0, index_1.createKnowledgeBase)(kbPath);
    // IMPORTANT: Set metadata first before creating any topics or facts
    console.log('\nSetting knowledge base metadata...');
    kb.setMetadata('Demo Knowledge Base', 'Example TypeScript knowledge base for demonstration purposes');
    console.log('✓ Metadata initialized');
    // Create some example topics (using topic names as IDs)
    const programmingTopic = kb.createTopic('Programming', 'Programming concepts and techniques');
    const typeScriptTopic = kb.createTopic('TypeScript', 'TypeScript language features');
    const webDevTopic = kb.createTopic('Web Development', 'Web development topics');
    console.log(`\nCreated topics:`);
    console.log(`- Programming: ${programmingTopic.name}`);
    console.log(`- TypeScript: ${typeScriptTopic.name}`);
    console.log(`- Web Development: ${webDevTopic.name}`);
    // Create some example facts with auto-generated numeric IDs
    const fact1 = kb.createFact('TypeScript is a superset of JavaScript that adds static type definitions.', new Set(['Programming', 'TypeScript']), new Set(['https://www.typescriptlang.org/', 'Official TypeScript Documentation']));
    const fact2 = kb.createFact('Classes in TypeScript can have private, protected, and public access modifiers.', new Set(['Programming', 'TypeScript']), new Set(['TypeScript Handbook', 'Personal experience']));
    const fact3 = kb.createFact('Modern web applications often use TypeScript for better developer experience.', new Set(['Programming', 'TypeScript', 'Web Development']), new Set(['Industry surveys', 'Developer community feedback']));
    console.log(`\nCreated facts with auto-generated IDs:`);
    console.log(`- Fact 1: ID ${fact1.id}`);
    console.log(`- Fact 2: ID ${fact2.id}`);
    console.log(`- Fact 3: ID ${fact3.id}`);
    // Query the knowledge base
    console.log('\\nKnowledge Base Statistics:');
    const stats = kb.getStats();
    console.log(`- Total Topics: ${stats.totalTopics}`);
    console.log(`- Total Facts: ${stats.totalFacts}`);
    console.log(`- Average Topics per Fact: ${stats.averageTopicsPerFact}`);
    console.log('\\nAll Topics:');
    kb.getAllTopics().forEach(topic => {
        console.log(`- ${topic.toString()}`);
    });
    console.log('\\nFacts with TypeScript topic:');
    const typeScriptFacts = kb.getFactsByTopicNames(['TypeScript']);
    typeScriptFacts.forEach(fact => {
        const factTopics = kb.getTopicsForFact(fact);
        const topicNames = factTopics.map(topic => topic.name).join(', ');
        console.log(`- ${fact.id}: [${topicNames}] ${fact.content}`);
    });
    console.log('\\nSearching for "class" in facts:');
    const searchResults = kb.searchFactsByContent('class');
    searchResults.forEach(fact => {
        console.log(`- ${fact.content}`);
    });
    console.log('\\nExample completed successfully!');
    console.log(`\\nData saved to: ${kbPath}`);
}
// Run the example if this file is executed directly
if (require.main === module) {
    main();
}
//# sourceMappingURL=example.js.map