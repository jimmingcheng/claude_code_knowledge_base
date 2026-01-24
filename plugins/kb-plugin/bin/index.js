"use strict";
// Main exports for the Claude Code Knowledge Base TypeScript library
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION = exports.KnowledgeAgent = exports.KnowledgeBase = exports.Fact = exports.Topic = void 0;
exports.createKnowledgeBase = createKnowledgeBase;
exports.createKnowledgeAgent = createKnowledgeAgent;
var Topic_1 = require("./Topic");
Object.defineProperty(exports, "Topic", { enumerable: true, get: function () { return Topic_1.Topic; } });
var Fact_1 = require("./Fact");
Object.defineProperty(exports, "Fact", { enumerable: true, get: function () { return Fact_1.Fact; } });
var KnowledgeBase_1 = require("./KnowledgeBase");
Object.defineProperty(exports, "KnowledgeBase", { enumerable: true, get: function () { return KnowledgeBase_1.KnowledgeBase; } });
var KnowledgeAgent_1 = require("./KnowledgeAgent");
Object.defineProperty(exports, "KnowledgeAgent", { enumerable: true, get: function () { return KnowledgeAgent_1.KnowledgeAgent; } });
// Import for internal use
const KnowledgeBase_2 = require("./KnowledgeBase");
const KnowledgeAgent_2 = require("./KnowledgeAgent");
// Version information
exports.VERSION = '1.0.0';
// Utility function to create a new knowledge base with initialization
function createKnowledgeBase(kbPath) {
    KnowledgeBase_2.KnowledgeBase.initializeKnowledgeBase(kbPath);
    return new KnowledgeBase_2.KnowledgeBase(kbPath);
}
// Utility function to create a new knowledge agent with initialization
function createKnowledgeAgent(kbPath) {
    return new KnowledgeAgent_2.KnowledgeAgent(kbPath);
}
//# sourceMappingURL=index.js.map