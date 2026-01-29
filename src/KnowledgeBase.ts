import * as fs from 'fs';
import * as path from 'path';
import { Topic } from './Topic';
import { Fact, Source } from './Fact';
import { KnowledgeBaseMetadata } from './KnowledgeBaseMetadata';

/**
 * Main knowledge base class that manages topics and facts.
 * Loads data from JSON files and provides methods for querying and updating the knowledge base.
 */
export class KnowledgeBase {
  private readonly kbPath: string;
  private topics: Topic[];
  private facts: Fact[];
  private metadata: KnowledgeBaseMetadata | null;

  constructor(kbPath: string) {
    this.kbPath = kbPath;
    this.metadata = this.loadMetadata(path.join(kbPath, 'kb.json'));
    this.topics = this.loadTopics(path.join(kbPath, 'topics.json'));
    this.facts = this.loadFacts(path.join(kbPath, 'facts.json'));
  }

  /**
   * Loads topics from the topics.json file.
   */
  private loadTopics(topicsJsonPath: string): Topic[] {
    if (!fs.existsSync(topicsJsonPath)) {
      return []; // Silent when file doesn't exist - this is expected
    }

    try {
      const fileContent = fs.readFileSync(topicsJsonPath, 'utf-8');
      const topicsData = JSON.parse(fileContent) as any[];
      return topicsData.map(topicObj => Topic.fromObject(topicObj));
    } catch (error) {
      console.warn(`Could not parse topics from ${topicsJsonPath}:`, error);
      return [];
    }
  }

  /**
   * Loads facts from the facts.json file.
   */
  private loadFacts(factsJsonPath: string): Fact[] {
    if (!fs.existsSync(factsJsonPath)) {
      return []; // Silent when file doesn't exist - this is expected
    }

    try {
      const fileContent = fs.readFileSync(factsJsonPath, 'utf-8');
      const factsData = JSON.parse(fileContent) as any[];
      return factsData.map(factObj => Fact.fromObject(factObj));
    } catch (error) {
      console.warn(`Could not parse facts from ${factsJsonPath}:`, error);
      return [];
    }
  }

  /**
   * Loads metadata from the kb.json file.
   */
  private loadMetadata(metadataJsonPath: string): KnowledgeBaseMetadata | null {
    if (!fs.existsSync(metadataJsonPath)) {
      return null; // Silent when file doesn't exist - this is expected
    }

    try {
      const fileContent = fs.readFileSync(metadataJsonPath, 'utf-8');
      const metadataData = JSON.parse(fileContent);
      return KnowledgeBaseMetadata.fromObject(metadataData);
    } catch (error) {
      console.warn(`Could not parse metadata from ${metadataJsonPath}:`, error);
      return null;
    }
  }

  /**
   * Saves topics to the topics.json file.
   */
  private saveTopics(): void {
    // Ensure kb.json exists and data files are created
    this.ensureDataFilesExist();

    const topicsJsonPath = path.join(this.kbPath, 'topics.json');
    const topicsData = this.topics.map(topic => topic.toObject());
    const jsonContent = JSON.stringify(topicsData, null, 2);
    fs.writeFileSync(topicsJsonPath, jsonContent, 'utf-8');
  }

  /**
   * Saves facts to the facts.json file.
   */
  private saveFacts(): void {
    // Ensure kb.json exists and data files are created
    this.ensureDataFilesExist();

    const factsJsonPath = path.join(this.kbPath, 'facts.json');
    const factsData = this.facts.map(fact => fact.toObject());
    const jsonContent = JSON.stringify(factsData, null, 2);
    fs.writeFileSync(factsJsonPath, jsonContent, 'utf-8');
  }

  /**
   * Saves metadata to the kb.json file.
   */
  private saveMetadata(): void {
    if (!this.metadata) {
      return; // Don't save if no metadata exists
    }

    // Ensure directory exists
    if (!fs.existsSync(this.kbPath)) {
      fs.mkdirSync(this.kbPath, { recursive: true });
    }

    const metadataJsonPath = path.join(this.kbPath, 'kb.json');
    const metadataData = this.metadata.toObject();
    const jsonContent = JSON.stringify(metadataData, null, 2);
    fs.writeFileSync(metadataJsonPath, jsonContent, 'utf-8');

    // Create CLAUDE.md protection file if it doesn't exist
    this.ensureClaudeProtectionFile();
  }

  /**
   * Returns all topics in the knowledge base.
   */
  getAllTopics(): Topic[] {
    return [...this.topics]; // Return a copy to prevent external modification
  }

  /**
   * Returns all facts in the knowledge base.
   */
  getAllFacts(): Fact[] {
    return [...this.facts]; // Return a copy to prevent external modification
  }

  /**
   * Returns the knowledge base metadata.
   */
  getMetadata(): KnowledgeBaseMetadata | null {
    return this.metadata;
  }

  /**
   * Checks if the knowledge base has metadata (kb.json exists and is loaded).
   */
  hasMetadata(): boolean {
    return this.metadata !== null;
  }

  /**
   * Sets the knowledge base metadata and saves it to kb.json.
   */
  setMetadata(name: string, description: string): KnowledgeBaseMetadata {
    this.metadata = new KnowledgeBaseMetadata(name, description);
    this.saveMetadata();
    return this.metadata;
  }

  /**
   * Returns facts that have any of the specified topics.
   */
  getFactsByTopics(topics: Topic[]): Fact[] {
    if (topics.length === 0) {
      return [];
    }
    return this.facts.filter(fact => fact.hasAnyTopic(topics));
  }

  /**
   * Returns facts that have any of the specified topic names.
   */
  getFactsByTopicNames(topicNames: string[]): Fact[] {
    if (topicNames.length === 0) {
      return [];
    }
    return this.facts.filter(fact => fact.hasAnyTopicName(topicNames));
  }

  /**
   * Returns facts that have all of the specified topics.
   */
  getFactsByAllTopics(topics: Topic[]): Fact[] {
    if (topics.length === 0) {
      return [...this.facts];
    }
    return this.facts.filter(fact => fact.hasAllTopics(topics));
  }

  /**
   * Returns facts that have all of the specified topic names.
   */
  getFactsByAllTopicNames(topicNames: string[]): Fact[] {
    if (topicNames.length === 0) {
      return [...this.facts];
    }
    return this.facts.filter(fact => fact.hasAllTopicNames(topicNames));
  }

  /**
   * Finds a topic by its name.
   */
  findTopicByName(name: string): Topic | undefined {
    return this.topics.find(topic => topic.name === name);
  }

  /**
   * Returns Topic objects for the given topic names.
   */
  getTopicsByNames(topicNames: string[]): Topic[] {
    return topicNames
      .map(name => this.findTopicByName(name))
      .filter((topic): topic is Topic => topic !== undefined);
  }

  /**
   * Returns Topic objects for a fact's topic names.
   */
  getTopicsForFact(fact: Fact): Topic[] {
    return this.getTopicsByNames(fact.getTopicNames());
  }

  /**
   * Finds a fact by its ID.
   */
  findFactById(id: number): Fact | undefined {
    return this.facts.find(fact => fact.id === id);
  }

  /**
   * Searches facts by content (case-insensitive substring match).
   */
  searchFactsByContent(query: string): Fact[] {
    const lowerQuery = query.toLowerCase();
    return this.facts.filter(fact =>
      fact.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Finds the maximum fact ID currently in use.
   */
  private getMaxFactId(): number {
    if (this.facts.length === 0) {
      return 0;
    }
    const numericIds = this.facts
      .map(fact => fact.id)
      .filter(id => typeof id === 'number' && !isNaN(id));

    if (numericIds.length === 0) {
      return 0;
    }
    return Math.max(...numericIds);
  }

  /**
   * Generates the next available fact ID.
   */
  getNextFactId(): number {
    return this.getMaxFactId() + 1;
  }

  /**
   * Creates a new topic. If a topic with the same name already exists, returns the existing one.
   */
  createTopic(name: string, description: string, isPersistent: boolean = false): Topic {
    // Check if topic already exists
    const existingTopic = this.findTopicByName(name);
    if (existingTopic) {
      return existingTopic;
    }

    const topic = new Topic(name, description, isPersistent);
    this.upsertTopic(topic);
    return topic;
  }

  /**
   * Creates a new fact with an auto-generated ID.
   * Topics will be created if they don't exist (as non-persistent auto-created topics).
   */
  createFact(content: string, topicNames: Set<string>, sources: Set<Source>): Fact {
    // Ensure all topics exist, create them if they don't (as non-persistent auto-created topics)
    for (const topicName of topicNames) {
      this.createTopic(topicName, `Information about ${topicName}`, false);
    }

    const id = this.getNextFactId();
    const fact = new Fact(id, content, topicNames, sources);
    this.upsertFact(fact);
    return fact;
  }

  /**
   * Inserts a new topic or updates an existing one (by name).
   */
  upsertTopic(topic: Topic): void {
    const existingIndex = this.topics.findIndex(t => t.name === topic.name);
    if (existingIndex >= 0) {
      this.topics[existingIndex] = topic;
    } else {
      this.topics.push(topic);
    }
    this.saveTopics();
  }

  /**
   * Inserts a new fact or updates an existing one (by ID).
   */
  upsertFact(fact: Fact): void {
    const existingIndex = this.facts.findIndex(f => f.id === fact.id);

    if (existingIndex >= 0) {
      this.facts[existingIndex] = fact;
    } else {
      this.facts.push(fact);
    }
    this.saveFacts();
  }

  /**
   * Removes a topic from the knowledge base.
   * Note: This does not remove the topic from facts that reference it.
   */
  removeTopic(topic: Topic): boolean {
    const initialLength = this.topics.length;
    this.topics = this.topics.filter(t => !t.equals(topic));

    if (this.topics.length < initialLength) {
      this.saveTopics();
      return true;
    }
    return false;
  }

  /**
   * Removes a topic by name from the knowledge base.
   */
  removeTopicByName(name: string): boolean {
    const topic = this.findTopicByName(name);
    if (topic) {
      return this.removeTopic(topic);
    }
    return false;
  }

  /**
   * Removes a fact from the knowledge base.
   */
  removeFact(fact: Fact): boolean {
    const initialLength = this.facts.length;
    this.facts = this.facts.filter(f => !f.equals(fact));

    if (this.facts.length < initialLength) {
      this.saveFacts();
      return true;
    }
    return false;
  }

  /**
   * Removes a fact by its ID.
   */
  removeFactById(id: number): boolean {
    const fact = this.findFactById(id);
    if (fact) {
      return this.removeFact(fact);
    }
    return false;
  }

  /**
   * Updates an existing fact by ID. Returns the updated fact or null if not found.
   */
  updateFact(id: number, content: string, topicNames: Set<string>, sources: Set<Source>): Fact | null {
    const existingIndex = this.facts.findIndex(f => f.id === id);
    if (existingIndex >= 0) {
      // Ensure all topics exist, create them if they don't (as non-persistent auto-created topics)
      for (const topicName of topicNames) {
        this.createTopic(topicName, `Information about ${topicName}`, false);
      }

      const updatedFact = new Fact(id, content, topicNames, sources);
      this.facts[existingIndex] = updatedFact;
      this.saveFacts();
      return updatedFact;
    }
    return null;
  }

  /**
   * Updates an existing topic's description. Returns the updated topic or null if not found.
   */
  updateTopic(name: string, newDescription: string): Topic | null {
    const existingIndex = this.topics.findIndex(t => t.name === name);
    if (existingIndex >= 0) {
      const existingTopic = this.topics[existingIndex];
      // Preserve the isPersistent value from the existing topic
      const updatedTopic = new Topic(name, newDescription, existingTopic.isPersistent);
      this.topics[existingIndex] = updatedTopic;
      this.saveTopics();
      return updatedTopic;
    }
    return null;
  }

  /**
   * Merges a source topic into a target topic, updating all facts that reference the source topic.
   * Returns true if successful, false if source or target topic doesn't exist.
   */
  mergeTopics(sourceTopicName: string, targetTopicName: string): boolean {
    const sourceTopic = this.findTopicByName(sourceTopicName);
    const targetTopic = this.findTopicByName(targetTopicName);

    if (!sourceTopic || !targetTopic) {
      return false;
    }

    // Update all facts that reference the source topic
    let factsUpdated = 0;
    this.facts.forEach((fact, index) => {
      if (fact.hasTopicName(sourceTopicName)) {
        // Create new topic set replacing source with target
        const newTopics = new Set<string>();
        for (const topicName of fact.topics) {
          if (topicName === sourceTopicName) {
            newTopics.add(targetTopicName);
          } else {
            newTopics.add(topicName);
          }
        }

        // Update the fact with new topics
        this.facts[index] = new Fact(fact.id, fact.content, newTopics, fact.sources);
        factsUpdated++;
      }
    });

    // Remove the source topic
    this.removeTopicByName(sourceTopicName);

    // Save changes
    if (factsUpdated > 0) {
      this.saveFacts();
    }

    return true;
  }

  /**
   * Renames a topic, updating all facts that reference it.
   * Returns true if successful, false if the old topic doesn't exist or new name already exists.
   */
  renameTopic(oldName: string, newName: string): boolean {
    const oldTopic = this.findTopicByName(oldName);
    const existingNewTopic = this.findTopicByName(newName);

    if (!oldTopic || existingNewTopic) {
      return false;
    }

    // Create new topic with the new name, same description, and preserve isPersistent value
    const newTopic = new Topic(newName, oldTopic.description, oldTopic.isPersistent);
    this.upsertTopic(newTopic);

    // Update all facts that reference the old topic
    let factsUpdated = 0;
    this.facts.forEach((fact, index) => {
      if (fact.hasTopicName(oldName)) {
        // Create new topic set replacing old name with new name
        const newTopics = new Set<string>();
        for (const topicName of fact.topics) {
          if (topicName === oldName) {
            newTopics.add(newName);
          } else {
            newTopics.add(topicName);
          }
        }

        // Update the fact with new topics
        this.facts[index] = new Fact(fact.id, fact.content, newTopics, fact.sources);
        factsUpdated++;
      }
    });

    // Remove the old topic
    this.removeTopicByName(oldName);

    // Save changes
    if (factsUpdated > 0) {
      this.saveFacts();
    }

    return true;
  }

  /**
   * Changes the persistence status of a topic.
   * Returns true if successful, false if topic doesn't exist.
   */
  setTopicPersistence(topicName: string, isPersistent: boolean): boolean {
    const existingIndex = this.topics.findIndex(t => t.name === topicName);
    if (existingIndex >= 0) {
      const existingTopic = this.topics[existingIndex];
      // Create new topic with updated persistence status, preserving other properties
      const updatedTopic = new Topic(existingTopic.name, existingTopic.description, isPersistent);
      this.topics[existingIndex] = updatedTopic;
      this.saveTopics();
      return true;
    }
    return false;
  }

  /**
   * Returns statistics about the knowledge base.
   */
  getStats(): {
    totalTopics: number;
    totalFacts: number;
    averageTopicsPerFact: number;
  } {
    const totalTopics = this.topics.length;
    const totalFacts = this.facts.length;
    const totalTopicReferences = this.facts.reduce((sum, fact) => sum + fact.topics.size, 0);
    const averageTopicsPerFact = totalFacts > 0 ? totalTopicReferences / totalFacts : 0;

    return {
      totalTopics,
      totalFacts,
      averageTopicsPerFact: Math.round(averageTopicsPerFact * 100) / 100, // Round to 2 decimal places
    };
  }

  /**
   * Creates the knowledge base directory.
   * Does NOT create topics.json or facts.json - those require kb.json to exist first.
   */
  static initializeKnowledgeBase(kbPath: string): void {
    // Create directory if it doesn't exist
    if (!fs.existsSync(kbPath)) {
      fs.mkdirSync(kbPath, { recursive: true });
    }
    // No longer automatically creates topics.json or facts.json
    // They will be created by ensureDataFilesExist() when needed
  }

  /**
   * Creates topics.json and facts.json if they don't exist.
   * REQUIRES kb.json to exist first.
   */
  private ensureDataFilesExist(): void {
    // Check if kb.json exists before creating data files
    const kbJsonPath = path.join(this.kbPath, 'kb.json');
    if (!fs.existsSync(kbJsonPath)) {
      throw new Error(
        'Knowledge base metadata (kb.json) must be created first. ' +
        'Use "claude-kb set-metadata <name> <description>" to initialize the knowledge base metadata before adding topics or facts.'
      );
    }

    // Create empty topics.json if it doesn't exist
    const topicsPath = path.join(this.kbPath, 'topics.json');
    if (!fs.existsSync(topicsPath)) {
      fs.writeFileSync(topicsPath, '[]', 'utf-8');
    }

    // Create empty facts.json if it doesn't exist
    const factsPath = path.join(this.kbPath, 'facts.json');
    if (!fs.existsSync(factsPath)) {
      fs.writeFileSync(factsPath, '[]', 'utf-8');
    }

    // Create CLAUDE.md protection file
    this.ensureClaudeProtectionFile();
  }

  /**
   * Creates CLAUDE.md protection file to prevent direct JSON modification by other agents.
   */
  private ensureClaudeProtectionFile(): void {
    const claudePath = path.join(this.kbPath, 'CLAUDE.md');

    // Only create if it doesn't exist (don't overwrite existing customizations)
    if (!fs.existsSync(claudePath)) {
      try {
        // Try to read the template from the src/templates directory
        const templatePath = path.join(__dirname, 'templates', 'CLAUDE.md');
        let claudeContent: string;

        if (fs.existsSync(templatePath)) {
          claudeContent = fs.readFileSync(templatePath, 'utf-8');
        } else {
          // Fallback: embedded template if template file not found
          claudeContent = this.getEmbeddedClaudeTemplate();
        }

        fs.writeFileSync(claudePath, claudeContent, 'utf-8');
      } catch (error) {
        // If template creation fails, create a minimal protection file
        const minimalContent = `# Knowledge Base Directory - Secure Access Required

⚠️ **DO NOT MODIFY FILES DIRECTLY**

This directory contains a structured knowledge base. Direct modification of JSON files can cause data corruption.

**For queries**: Use \`kb-query\` skill
**For modifications**: Use \`claude-code task kb-agent "<request>"\`

Direct file editing bypasses input validation and semantic understanding.`;

        fs.writeFileSync(claudePath, minimalContent, 'utf-8');
      }
    }
  }

  /**
   * Returns embedded CLAUDE.md template as fallback.
   */
  private getEmbeddedClaudeTemplate(): string {
    return `# Knowledge Base Directory - Secure Access Required

🔒 **IMPORTANT SECURITY NOTICE**: This directory contains a structured knowledge base that requires secure access protocols.

## ⚠️ DO NOT MODIFY FILES DIRECTLY

**Never directly edit these JSON files:**
- \`kb.json\` - Knowledge base metadata
- \`topics.json\` - Topic definitions and persistence settings
- \`facts.json\` - Fact content and topic associations

Direct modification bypasses critical input validation and can cause:
- Malformed topic names (entire content blocks as topic IDs)
- Data corruption and inconsistencies
- Security vulnerabilities
- Loss of semantic understanding

## ✅ Proper Access Methods

### For Read-Only Queries
Use the secure \`kb-query\` skill for fast, safe information retrieval:

\`\`\`bash
# Check knowledge base status and metadata
kb-query info

# List all available topics
kb-query list-topics

# Search for facts by topics (OR logic)
kb-query facts-by-any-topics authentication,security,api
\`\`\`

### For Content Modifications
**All mutations must go through kb-agent** for intelligent validation:

\`\`\`bash
# Add new knowledge with semantic topic extraction
claude-code task kb-agent "remember that we use TypeScript for type safety"

# Create organized topic structures
claude-code task kb-agent "create a topic for authentication decisions"

# Organize and clean up knowledge base
claude-code task kb-agent "organize topics better and fix any inconsistencies"
\`\`\`

## 🛡️ Security Architecture

This knowledge base uses a **hybrid tool-based security model** with input validation and semantic understanding.

**This directory is protected by intelligent agents. Respect the security model.**`;
  }
}