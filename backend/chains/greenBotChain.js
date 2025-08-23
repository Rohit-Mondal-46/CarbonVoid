const { ConversationChain } = require('langchain/chains');
const { BufferMemory } = require('langchain/memory');
const localLLM = require('../llm/localLLM'); // Ensure this path is correct

const memory = new BufferMemory();

const greenBotChain = new ConversationChain({
  llm: localLLM,
  memory,
});

module.exports = greenBotChain;
