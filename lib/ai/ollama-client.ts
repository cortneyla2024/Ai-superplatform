interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatResponse {
  message?: {
    content: string;
    role: string;
  };
  response?: string;
}

export class OllamaClient {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    this.model = process.env.OLLAMA_MODEL || "llama2";
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Ollama request error:", error);
      throw new Error("Failed to connect to Ollama server. Make sure Ollama is running.");
    }
  }

  async chat(message: string, context: string = ""): Promise<string> {
    const prompt = context
      ? `Context: ${context}\n\nUser: ${message}\n\nAssistant:`
      : `User: ${message}\n\nAssistant:`;

    try {
      const response = await this.makeRequest("/api/generate", {
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500,
        },
      });

      return response.response || "I apologize, but I encountered an error processing your request.";
    } catch (error) {
      console.error("Chat error:", error);
      return "I apologize, but I am currently unable to respond. Please try again later.";
    }
  }

  async chat(params: { model?: string; messages: ChatMessage[] }): Promise<ChatResponse> {
    const model = params.model || this.model;
    const messages = params.messages;

    // Convert messages to a single prompt
    const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join("\n\n");

    try {
      const response = await this.makeRequest("/api/generate", {
        model: model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500,
        },
      });

      return {
        message: {
          content: response.response || "",
          role: "assistant",
        },
        response: response.response || "",
      };
    } catch (error) {
      console.error("Chat error:", error);
      return {
        message: {
          content: "I apologize, but I am currently unable to respond. Please try again later.",
          role: "assistant",
        },
        response: "I apologize, but I am currently unable to respond. Please try again later.",
      };
    }
  }

  async generateText(prompt: string, maxTokens: number = 200): Promise<string> {
    try {
      const response = await this.makeRequest("/api/generate", {
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9,
          max_tokens: maxTokens,
        },
      });

      return response.response || "";
    } catch (error) {
      console.error("Text generation error:", error);
      return "";
    }
  }

  async composeMusic(description: string): Promise<string> {
    const prompt = `Create a musical composition based on this description: "${description}". 
    Provide a JSON structure with the following format:
    {
      "title": "Composition Title",
      "bpm": 120,
      "key": "C major",
      "notes": [
        {"note": "C4", "duration": "4n", "time": 0},
        {"note": "E4", "duration": "4n", "time": 0.5},
        {"note": "G4", "duration": "4n", "time": 1}
      ]
    }
    
    Make sure the composition matches the mood and style described.`;

    try {
      const response = await this.makeRequest("/api/generate", {
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.9,
          top_p: 0.95,
          max_tokens: 800,
        },
      });

      return response.response || "";
    } catch (error) {
      console.error("Music composition error:", error);
      return "";
    }
  }

  async learnResponse(question: string, context: string = ""): Promise<string> {
    const prompt = context
      ? `Based on the following context, please provide a helpful and educational response to this question: "${question}"
      
      Context: ${context}
      
      Please provide a clear, informative answer that helps the user understand the topic better.`
      : `Please provide a helpful and educational response to this question: "${question}"
      
      Please provide a clear, informative answer that helps the user understand the topic better.`;

    try {
      const response = await this.makeRequest("/api/generate", {
        model: this.model,
        prompt,
        stream: false,
        options: {
          temperature: 0.6,
          top_p: 0.9,
          max_tokens: 600,
        },
      });

      return response.response || "I apologize, but I encountered an error while trying to help you learn.";
    } catch (error) {
      console.error("Learning response error:", error);
      return "I apologize, but I am currently unable to provide educational assistance. Please try again later.";
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const ollamaClient = new OllamaClient();

