// @vitality/ai-service module
import { ascendedAI } from './ascended-core';
import { genesisFoundry } from './genesis-foundry';

export { ascendedAI, genesisFoundry };

export const aiservice = {
  version: '1.0.0',
  name: '@vitality/ai-service',
  ascendedAI,
  genesisFoundry
};

// Export types
export type { AIIdentity, AIPrinciple, AIPersona, AIResponse, AIState } from './ascended-core';
export type { KnowledgeNode, MicroModel, InternalService, Resource } from './genesis-foundry';
