"use strict";
// Main exports for the Claude Code Knowledge Base TypeScript library
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.KnowledgeBaseMetadata = exports.KnowledgeBase = exports.Fact = exports.Topic = void 0;
exports.createKnowledgeBase = createKnowledgeBase;
var Topic_1 = require("./Topic");
Object.defineProperty(exports, "Topic", { enumerable: true, get: function () { return Topic_1.Topic; } });
var Fact_1 = require("./Fact");
Object.defineProperty(exports, "Fact", { enumerable: true, get: function () { return Fact_1.Fact; } });
var KnowledgeBase_1 = require("./KnowledgeBase");
Object.defineProperty(exports, "KnowledgeBase", { enumerable: true, get: function () { return KnowledgeBase_1.KnowledgeBase; } });
var KnowledgeBaseMetadata_1 = require("./KnowledgeBaseMetadata");
Object.defineProperty(exports, "KnowledgeBaseMetadata", { enumerable: true, get: function () { return KnowledgeBaseMetadata_1.KnowledgeBaseMetadata; } });
// Import for internal use
const KnowledgeBase_2 = require("./KnowledgeBase");
// Version information
exports.VERSION = '1.3.0';
// Utility function to create a new knowledge base with initialization
function createKnowledgeBase(kbPath) {
    KnowledgeBase_2.KnowledgeBase.initializeKnowledgeBase(kbPath);
    return new KnowledgeBase_2.KnowledgeBase(kbPath);
}
//# sourceMappingURL=index.js.map