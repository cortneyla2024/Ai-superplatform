const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export async function getLocalAIResponse(prompt: string, history: any[] = []) {
  try {
    const messages = [...history, { role: 'user', content: prompt }];
    const systemMessage = {
      role: 'system',
      content: 'You are an AI assistant. Provide concise and helpful responses.',
    };
    const payload = { 
      model: 'mistral:instruct', 
      messages: [systemMessage, ...messages], 
      stream: false 
    };
    const response = await fetch(`${OLLAMA_URL}/api/chat`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });
    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.error('Error fetching from local AI:', error);
    throw new Error('Failed to get a response from the local AI.');
  }
}

export async function getMusicComposition(prompt: string) {
  // Simple music composition based on prompt
  return {
    instrument: 'piano',
    bpm: 100,
    notes: [
      { note: 'C4', duration: '4n' },
      { note: 'E4', duration: '4n' },
      { note: 'G4', duration: '4n' },
      { note: 'C5', duration: '4n' },
    ]
  };
}
