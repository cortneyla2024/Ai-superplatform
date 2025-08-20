import { OllamaClient } from "./ollama-client";
import { z } from "zod";

const MusicCompositionSchema = z.object({
  title: z.string(),
  bpm: z.number().min(60).max(200),
  key: z.string(),
  notes: z.array(z.object({
    note: z.string(),
    duration: z.string(),
    time: z.number(),
  })),
});

export interface MusicComposition {
  title: string;
  bpm: number;
  key: string;
  notes: Array<{
    note: string;
    duration: string;
    time: number;
  }>;
}

export class MusicClient {
  private ollamaClient: OllamaClient;

  constructor() {
    this.ollamaClient = new OllamaClient();
  }

  async generateComposition(prompt: string): Promise<MusicComposition> {
    try {
      const response = await this.ollamaClient.composeMusic(prompt);

      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          const validated = MusicCompositionSchema.parse(parsed);
          return validated;
        } catch (parseError) {
          console.error("Error parsing music composition:", parseError);
        }
      }

      // Fallback composition if parsing fails
      return this.generateFallbackComposition(prompt);
    } catch (error) {
      console.error("Error generating music composition:", error);
      return this.generateFallbackComposition(prompt);
    }
  }

  private generateFallbackComposition(prompt: string): MusicComposition {
    // Generate a simple fallback composition based on the prompt
    const mood = this.analyzeMood(prompt);

    let bpm = 120;
    let key = "C major";
    let notes: Array<{ note: string; duration: string; time: number }> = [];

    if (mood === "calm" || mood === "peaceful") {
      bpm = 80;
      key = "F major";
      notes = [
        { note: "F4", duration: "2n", time: 0 },
        { note: "A4", duration: "2n", time: 0.5 },
        { note: "C5", duration: "2n", time: 1 },
        { note: "F5", duration: "2n", time: 1.5 },
        { note: "A4", duration: "2n", time: 2 },
        { note: "C5", duration: "2n", time: 2.5 },
        { note: "F4", duration: "2n", time: 3 },
        { note: "A4", duration: "2n", time: 3.5 },
      ];
    } else if (mood === "energetic" || mood === "upbeat") {
      bpm = 140;
      key = "G major";
      notes = [
        { note: "G4", duration: "4n", time: 0 },
        { note: "B4", duration: "4n", time: 0.25 },
        { note: "D5", duration: "4n", time: 0.5 },
        { note: "G5", duration: "4n", time: 0.75 },
        { note: "D5", duration: "4n", time: 1 },
        { note: "B4", duration: "4n", time: 1.25 },
        { note: "G4", duration: "4n", time: 1.5 },
        { note: "D4", duration: "4n", time: 1.75 },
      ];
    } else if (mood === "melancholic" || mood === "sad") {
      bpm = 70;
      key = "A minor";
      notes = [
        { note: "A3", duration: "2n", time: 0 },
        { note: "C4", duration: "2n", time: 0.5 },
        { note: "E4", duration: "2n", time: 1 },
        { note: "A4", duration: "2n", time: 1.5 },
        { note: "C4", duration: "2n", time: 2 },
        { note: "E4", duration: "2n", time: 2.5 },
        { note: "A3", duration: "2n", time: 3 },
        { note: "C4", duration: "2n", time: 3.5 },
      ];
    } else {
      // Default happy/neutral composition
      bpm = 120;
      key = "C major";
      notes = [
        { note: "C4", duration: "4n", time: 0 },
        { note: "E4", duration: "4n", time: 0.25 },
        { note: "G4", duration: "4n", time: 0.5 },
        { note: "C5", duration: "4n", time: 0.75 },
        { note: "G4", duration: "4n", time: 1 },
        { note: "E4", duration: "4n", time: 1.25 },
        { note: "C4", duration: "4n", time: 1.5 },
        { note: "G3", duration: "4n", time: 1.75 },
      ];
    }

    return {
      title: `AI Generated ${mood.charAt(0).toUpperCase() + mood.slice(1)} Music`,
      bpm,
      key,
      notes,
    };
  }

  private analyzeMood(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes("calm") || lowerPrompt.includes("peaceful") ||
        lowerPrompt.includes("relaxing") || lowerPrompt.includes("gentle")) {
      return "calm";
    }

    if (lowerPrompt.includes("energetic") || lowerPrompt.includes("upbeat") ||
        lowerPrompt.includes("fast") || lowerPrompt.includes("dance")) {
      return "energetic";
    }

    if (lowerPrompt.includes("sad") || lowerPrompt.includes("melancholic") ||
        lowerPrompt.includes("slow") || lowerPrompt.includes("sorrow")) {
      return "melancholic";
    }

    return "happy";
  }

  validateComposition(composition: any): composition is MusicComposition {
    try {
      MusicCompositionSchema.parse(composition);
      return true;
    } catch {
      return false;
    }
  }

  getValidOptions(): any {
    return {
      moods: ["calm", "energetic", "melancholic", "happy"],
      keys: ["C major", "G major", "F major", "A minor", "D minor"],
      bpms: [60, 80, 100, 120, 140, 160, 180, 200],
      instruments: ["piano", "guitar", "strings", "synth", "drums"],
    };
  }
}
