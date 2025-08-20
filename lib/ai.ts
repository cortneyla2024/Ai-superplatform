// AI Client for Ollama Integration
export interface OllamaResponse {
  response: string;
  done: boolean;
}

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
}

// Placeholder functions for Ollama API calls
export async function chatWithOllama(prompt: string, model: string = "llama3"): Promise<string> {
  try {
    const response = await fetch(`${process.env.OLLAMA_API_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || "";
  } catch (error) {
    console.error("Ollama chat error:", error);
    return "I apologize, but I am currently unable to process your request.";
  }
}

export async function generateImage(prompt: string, model: string = "llava"): Promise<string> {
  try {
    const response = await fetch(`${process.env.OLLAMA_API_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama image generation error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response || "";
  } catch (error) {
    console.error("Ollama image generation error:", error);
    return "";
  }
}

export async function streamChatWithOllama(
  prompt: string,
  model: string = "llama3",
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const response = await fetch(`${process.env.OLLAMA_API_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama streaming error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body reader available");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
break;
}

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split("\n").filter(line => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) {
            onChunk(data.response);
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    }
  } catch (error) {
    console.error("Ollama streaming error:", error);
    onChunk("I apologize, but I am currently unable to process your request.");
  }
}

// Legacy function for backward compatibility
export async function generateAIResponse(prompt: string, context: any): Promise<any> {
  try {
    const response = await chatWithOllama(prompt);
    return {
      content: response,
      confidence: 0.8,
      metadata: {
        model: process.env.OLLAMA_CHAT_MODEL || "llama3",
        context,
        tokens: 0,
      },
    };
  } catch (error) {
    console.error("AI generation error:", error);
    return {
      content: "I apologize, but I am experiencing technical difficulties. Please try again later.",
      confidence: 0.0,
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}
