# Claude Code Knowledge Base - TypeScript

A TypeScript-based knowledge base system for organizing facts and tags using JSON storage.

## Overview

This system provides a structured way to store and retrieve knowledge using:
- **Tags**: Categories and labels for organizing information
- **Facts**: Individual pieces of knowledge with associated tags and sources
- **Knowledge Base**: Main system for managing tags and facts with JSON persistence

## Installation

```bash
# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Run the example
npm run dev
```

## Project Structure

```
src/
├── index.ts           # Main exports
├── Tag.ts            # Tag class definition
├── Fact.ts           # Fact class definition
├── KnowledgeBase.ts  # Main knowledge base system
└── example.ts        # Usage example
```

## Usage

### Basic Setup

```typescript
import { KnowledgeBase, Tag, Fact, createKnowledgeBase } from './src/index';

// Create or load a knowledge base
const kb = createKnowledgeBase('./my_knowledge_base');
```

### Working with Tags

```typescript
// Create a new tag
const programmingTag = new Tag(
  'prog-001',
  'Programming',
  'Programming concepts and techniques'
);

// Add to knowledge base
kb.upsertTag(programmingTag);

// Find tags
const foundTag = kb.findTagById('prog-001');
```

### Working with Facts

```typescript
// Create a new fact
const fact = new Fact(
  'fact-001',
  'TypeScript is a superset of JavaScript.',
  new Set([programmingTag]),
  new Set(['https://typescriptlang.org/'])
);

// Add to knowledge base
kb.upsertFact(fact);

// Query facts
const factsWithTag = kb.getFactsByTags([programmingTag]);
const searchResults = kb.searchFactsByContent('TypeScript');
```

### Querying the Knowledge Base

```typescript
// Get all items
const allTags = kb.getAllTags();
const allFacts = kb.getAllFacts();

// Find by tags
const factsWithAnyTag = kb.getFactsByTags([tag1, tag2]);
const factsWithAllTags = kb.getFactsByAllTags([tag1, tag2]);

// Search by content
const searchResults = kb.searchFactsByContent('JavaScript');

// Get statistics
const stats = kb.getStats();
console.log(`Total facts: ${stats.totalFacts}`);
```

## Data Storage

The system uses JSON files for persistence:
- `tags.json`: Array of tag objects
- `facts.json`: Array of fact objects

### JSON Schema

**tags.json:**
```json
[
  {
    "id": "prog-001",
    "name": "Programming",
    "description": "Programming concepts and techniques"
  }
]
```

**facts.json:**
```json
[
  {
    "id": "fact-001",
    "content": "TypeScript is a superset of JavaScript.",
    "tags": [
      {
        "id": "prog-001",
        "name": "Programming",
        "description": "Programming concepts and techniques"
      }
    ],
    "sources": ["https://typescriptlang.org/"]
  }
]
```

## Key Features

### Tag Class
- Immutable data structure
- Equality comparison by ID
- Serialization to/from JSON
- String representation

### Fact Class
- Immutable data structure with Set-based tags and sources
- Tag querying methods (`hasTag`, `hasAnyTag`, `hasAllTags`)
- Serialization to/from JSON

### Knowledge Base Class
- JSON-based persistence
- CRUD operations for tags and facts
- Advanced querying (by tags, content search)
- Statistics and reporting
- Automatic file creation and initialization

## Development

### Building
```bash
npm run build
```

### Running Example
```bash
npm run dev
```

### Cleaning
```bash
npm run clean
```

## Migration from Python

This TypeScript version provides equivalent functionality to the Python version with these improvements:

1. **JSON instead of YAML**: Better performance and native JavaScript support
2. **Class-based design**: Both Tag and Fact are classes that can have methods
3. **Immutable design**: Objects are readonly to prevent accidental mutations
4. **Type safety**: Full TypeScript type checking
5. **Enhanced querying**: More methods for finding and filtering data
6. **Automatic persistence**: Changes are automatically saved to JSON files

## License

MIT License