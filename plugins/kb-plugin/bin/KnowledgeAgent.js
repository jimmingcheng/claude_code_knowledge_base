"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeAgent = void 0;
exports.createKnowledgeAgent = createKnowledgeAgent;
const KnowledgeBase_1 = require("./KnowledgeBase");
/**
 * KnowledgeAgent - Semantic processing layer for Claude Code Knowledge Base
 *
 * This class provides intelligent operations on top of the KnowledgeBase data layer,
 * including natural language query processing, conflict detection, and knowledge organization.
 */
class KnowledgeAgent {
    constructor(kbPath) {
        // Initialize knowledge base - creates directory and files if they don't exist
        KnowledgeBase_1.KnowledgeBase.initializeKnowledgeBase(kbPath);
        this.kb = new KnowledgeBase_1.KnowledgeBase(kbPath);
    }
    /**
     * Process a natural language query and return relevant knowledge
     */
    async processQuery(query) {
        // For now, implement basic keyword-based matching
        // In a real implementation, this would use more sophisticated NLP
        const queryLower = query.toLowerCase();
        const words = queryLower.split(/\s+/).filter(word => word.length > 2);
        // Get all facts and topics for analysis
        const allFacts = this.kb.getAllFacts();
        const allTopics = this.kb.getAllTopics();
        // Find facts that contain query keywords
        const relevantFacts = allFacts.filter(fact => {
            const contentLower = fact.content.toLowerCase();
            return words.some(word => contentLower.includes(word));
        });
        // Find topics mentioned in the query or related to relevant facts
        const suggestedTopics = [];
        // Check if query mentions any topic names directly
        for (const topic of allTopics) {
            if (queryLower.includes(topic.name.toLowerCase())) {
                suggestedTopics.push(topic.name);
            }
        }
        // Add topics from relevant facts
        for (const fact of relevantFacts) {
            for (const topicName of fact.topics) {
                if (!suggestedTopics.includes(topicName)) {
                    suggestedTopics.push(topicName);
                }
            }
        }
        // Generate summary
        let summary = '';
        if (relevantFacts.length === 0) {
            summary = `No facts found matching "${query}". You might want to add this knowledge to the knowledge base.`;
        }
        else {
            summary = `Found ${relevantFacts.length} relevant fact(s) for "${query}":`;
            if (suggestedTopics.length > 0) {
                summary += ` Related topics: ${suggestedTopics.join(', ')}`;
            }
        }
        return {
            relevantFacts,
            suggestedTopics,
            summary
        };
    }
    /**
     * Add new knowledge to the knowledge base with conflict detection
     */
    async addKnowledge(content, suggestedTopics = [], sources = []) {
        // Analyze for conflicts with existing knowledge
        const conflicts = await this.detectConflicts(content);
        let addedFact;
        const suggestions = [];
        if (conflicts.length === 0) {
            // No conflicts, safe to add
            // Ensure suggested topics exist, create them if they don't
            for (const topicName of suggestedTopics) {
                const existingTopic = this.kb.findTopicByName(topicName);
                if (!existingTopic) {
                    this.kb.createTopic(topicName, `Auto-created topic for ${topicName}`);
                    suggestions.push(`Created new topic: ${topicName}`);
                }
            }
            addedFact = this.kb.createFact(content, new Set(suggestedTopics), new Set(sources));
            suggestions.push(`Added new fact with ID: ${addedFact.id}`);
        }
        else {
            suggestions.push('Conflicts detected. Please review before adding.');
            for (const conflict of conflicts) {
                suggestions.push(`- ${conflict.type}: ${conflict.description}`);
            }
        }
        return {
            conflicts,
            addedFact,
            suggestions
        };
    }
    /**
     * Detect conflicts between new content and existing knowledge
     */
    async detectConflicts(newContent) {
        const conflicts = [];
        const allFacts = this.kb.getAllFacts();
        const newContentLower = newContent.toLowerCase();
        for (const fact of allFacts) {
            const factContentLower = fact.content.toLowerCase();
            // Check for exact duplicates
            if (factContentLower === newContentLower) {
                conflicts.push({
                    type: 'duplicate',
                    conflictingFact: fact,
                    description: 'Identical content already exists in the knowledge base'
                });
                continue;
            }
            // Check for high similarity (simple implementation)
            const similarity = this.calculateSimilarity(newContentLower, factContentLower);
            if (similarity > 0.7) {
                conflicts.push({
                    type: 'similar',
                    conflictingFact: fact,
                    description: `Very similar content exists (${Math.round(similarity * 100)}% similar)`
                });
            }
            // Check for potential contradictions (basic keyword analysis)
            if (this.detectContradiction(newContentLower, factContentLower)) {
                conflicts.push({
                    type: 'contradiction',
                    conflictingFact: fact,
                    description: 'Content may contradict existing knowledge'
                });
            }
        }
        return conflicts;
    }
    /**
     * Calculate similarity between two strings (simple implementation)
     */
    calculateSimilarity(str1, str2) {
        const words1 = new Set(str1.split(/\s+/));
        const words2 = new Set(str2.split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size;
    }
    /**
     * Detect potential contradictions between two pieces of content
     */
    detectContradiction(content1, content2) {
        // Basic contradiction detection using opposing keywords
        const contradictionPairs = [
            ['is', 'is not'],
            ['does', 'does not'],
            ['will', 'will not'],
            ['can', 'cannot'],
            ['believes', 'does not believe'],
            ['loves', 'hates'],
            ['likes', 'dislikes']
        ];
        for (const [positive, negative] of contradictionPairs) {
            if ((content1.includes(positive) && content2.includes(negative)) ||
                (content1.includes(negative) && content2.includes(positive))) {
                return true;
            }
        }
        return false;
    }
    /**
     * Get knowledge base statistics and organization suggestions
     */
    async analyzeKnowledge() {
        const stats = this.kb.getStats();
        const organizationSuggestions = [];
        const allTopics = this.kb.getAllTopics();
        const allFacts = this.kb.getAllFacts();
        // Check for underused topics
        for (const topic of allTopics) {
            const factsWithTopic = this.kb.getFactsByTopicNames([topic.name]);
            if (factsWithTopic.length === 0) {
                organizationSuggestions.push(`Topic "${topic.name}" has no facts - consider removing it`);
            }
            else if (factsWithTopic.length === 1) {
                organizationSuggestions.push(`Topic "${topic.name}" has only 1 fact - consider if it needs its own topic`);
            }
        }
        // Check for facts with too many topics
        for (const fact of allFacts) {
            if (fact.topics.size > 5) {
                organizationSuggestions.push(`Fact ${fact.id} has ${fact.topics.size} topics - might be over-categorized`);
            }
        }
        // Check for potential topic merging opportunities
        const topicNames = allTopics.map(t => t.name);
        for (let i = 0; i < topicNames.length; i++) {
            for (let j = i + 1; j < topicNames.length; j++) {
                const topic1 = topicNames[i];
                const topic2 = topicNames[j];
                if (this.calculateSimilarity(topic1.toLowerCase(), topic2.toLowerCase()) > 0.6) {
                    organizationSuggestions.push(`Topics "${topic1}" and "${topic2}" seem similar - consider merging`);
                }
            }
        }
        return {
            stats,
            organizationSuggestions
        };
    }
    /**
     * Get the underlying knowledge base for direct operations
     */
    getKnowledgeBase() {
        return this.kb;
    }
}
exports.KnowledgeAgent = KnowledgeAgent;
/**
 * Factory function to create a new KnowledgeAgent
 */
function createKnowledgeAgent(kbPath) {
    return new KnowledgeAgent(kbPath);
}
//# sourceMappingURL=KnowledgeAgent.js.map