export interface TTSConfig {
  voice: string;
  rate: number; // 0.1 to 10
  pitch: number; // 0 to 2
  volume: number; // 0 to 1
  emotion: "neutral" | "joy" | "empathy" | "concern" | "curiosity" | "excitement" | "calm";
}

export interface TTSResponse {
  audio: Blob;
  duration: number;
  wordTimings: Array<{
    word: string;
    startTime: number;
    endTime: number;
  }>;
}

export class EmotionalTTS {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private onWordBoundary: ((word: string, startTime: number, endTime: number) => void) | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices(): void {
    // Load available voices
    const loadVoices = () => {
      this.voices = this.synthesis.getVoices();
    };

    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }

  private getEmotionConfig(emotion: string): Partial<TTSConfig> {
    switch (emotion) {
      case "joy":
        return {
          rate: 1.1,
          pitch: 1.2,
          volume: 0.9,
        };
      case "empathy":
        return {
          rate: 0.9,
          pitch: 0.9,
          volume: 0.8,
        };
      case "concern":
        return {
          rate: 0.8,
          pitch: 0.8,
          volume: 0.7,
        };
      case "curiosity":
        return {
          rate: 1.0,
          pitch: 1.1,
          volume: 0.85,
        };
      case "excitement":
        return {
          rate: 1.2,
          pitch: 1.3,
          volume: 0.95,
        };
      case "calm":
        return {
          rate: 0.85,
          pitch: 0.9,
          volume: 0.75,
        };
      default:
        return {
          rate: 1.0,
          pitch: 1.0,
          volume: 0.8,
        };
    }
  }

  private analyzeTextEmotion(text: string): string {
    const lowerText = text.toLowerCase();

    // Joy indicators
    if (lowerText.includes("great") || lowerText.includes("wonderful") ||
        lowerText.includes("amazing") || lowerText.includes("excellent") ||
        lowerText.includes("fantastic") || lowerText.includes("brilliant")) {
      return "joy";
    }

    // Empathy indicators
    if (lowerText.includes("understand") || lowerText.includes("feel") ||
        lowerText.includes("sorry") || lowerText.includes("difficult") ||
        lowerText.includes("challenging") || lowerText.includes("struggling")) {
      return "empathy";
    }

    // Concern indicators
    if (lowerText.includes("worried") || lowerText.includes("concerned") ||
        lowerText.includes("anxious") || lowerText.includes("stress") ||
        lowerText.includes("problem") || lowerText.includes("issue")) {
      return "concern";
    }

    // Curiosity indicators
    if (lowerText.includes("tell me") || lowerText.includes("how") ||
        lowerText.includes("what") || lowerText.includes("why") ||
        lowerText.includes("explain") || lowerText.includes("describe")) {
      return "curiosity";
    }

    // Excitement indicators
    if (lowerText.includes("exciting") || lowerText.includes("incredible") ||
        lowerText.includes("unbelievable") || lowerText.includes("wow") ||
        lowerText.includes("awesome") || lowerText.includes("outstanding")) {
      return "excitement";
    }

    // Calm indicators
    if (lowerText.includes("relax") || lowerText.includes("peaceful") ||
        lowerText.includes("gentle") || lowerText.includes("soft") ||
        lowerText.includes("quiet") || lowerText.includes("serene")) {
      return "calm";
    }

    return "neutral";
  }

  private findBestVoice(emotion: string): SpeechSynthesisVoice | null {
    // Prefer voices that match the emotion
    const emotionVoiceMap: Record<string, string[]> = {
      joy: ["en-US", "en-GB"],
      empathy: ["en-US", "en-GB"],
      concern: ["en-US", "en-GB"],
      curiosity: ["en-US", "en-GB"],
      excitement: ["en-US", "en-GB"],
      calm: ["en-US", "en-GB"],
      neutral: ["en-US", "en-GB"],
    };

    const preferredLanguages = emotionVoiceMap[emotion] || ["en-US"];

    // Find the best available voice
    for (const lang of preferredLanguages) {
      const voice = this.voices.find(v =>
        v.lang.startsWith(lang) &&
        (v.name.includes("Female") || v.name.includes("female"))
      );
      if (voice) {
return voice;
}
    }

    // Fallback to any English voice
    return this.voices.find(v => v.lang.startsWith("en")) || this.voices[0] || null;
  }

  async speak(text: string, config: Partial<TTSConfig> = {}): Promise<TTSResponse> {
    return new Promise((resolve, reject) => {
      try {
        // Cancel any current speech
        this.stop();

        // Analyze text emotion if not provided
        const emotion = config.emotion || this.analyzeTextEmotion(text);
        const emotionConfig = this.getEmotionConfig(emotion);

        // Merge configurations
        const finalConfig: TTSConfig = {
          voice: config.voice || "default",
          rate: config.rate ?? emotionConfig.rate ?? 1.0,
          pitch: config.pitch ?? emotionConfig.pitch ?? 1.0,
          volume: config.volume ?? emotionConfig.volume ?? 0.8,
          emotion,
        };

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);

        // Set voice
        const voice = this.findBestVoice(emotion);
        if (voice) {
          utterance.voice = voice;
        }

        // Set properties
        utterance.rate = finalConfig.rate;
        utterance.pitch = finalConfig.pitch;
        utterance.volume = finalConfig.volume;

        // Track word boundaries for lip sync
        const wordTimings: Array<{ word: string; startTime: number; endTime: number }> = [];
        let currentTime = 0;

        utterance.onboundary = (event) => {
          if (event.name === "word") {
            const word = text.substring(event.charIndex, event.charIndex + event.charLength);
            const startTime = currentTime;
            const endTime = currentTime + (word.length * 100); // Rough estimate

            wordTimings.push({ word, startTime, endTime });

            if (this.onWordBoundary) {
              this.onWordBoundary(word, startTime, endTime);
            }

            currentTime = endTime;
          }
        };

        // Handle completion
        utterance.onend = () => {
          this.isSpeaking = false;
          this.currentUtterance = null;

          resolve({
            audio: new Blob(), // Placeholder - in real implementation, capture audio
            duration: currentTime,
            wordTimings,
          });
        };

        utterance.onerror = (error) => {
          this.isSpeaking = false;
          this.currentUtterance = null;
          reject(error);
        };

        // Start speaking
        this.currentUtterance = utterance;
        this.isSpeaking = true;
        this.synthesis.speak(utterance);

      } catch (error) {
        reject(error);
      }
    });
  }

  stop(): void {
    if (this.isSpeaking && this.currentUtterance) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  pause(): void {
    if (this.isSpeaking) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.isSpeaking) {
      this.synthesis.resume();
    }
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  onWordBoundaryEvent(callback: (word: string, startTime: number, endTime: number) => void): void {
    this.onWordBoundary = callback;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return [...this.voices];
  }

  // Advanced features for future enhancement
  async speakWithEmphasis(text: string, emphasisWords: string[]): Promise<TTSResponse> {
    // Add SSML-like emphasis to specific words
    let processedText = text;

    for (const word of emphasisWords) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      processedText = processedText.replace(regex, `<emphasis>${word}</emphasis>`);
    }

    return this.speak(processedText);
  }

  async speakWithPauses(text: string, pausePoints: number[]): Promise<TTSResponse> {
    // Insert pauses at specific character positions
    let processedText = text;

    for (let i = pausePoints.length - 1; i >= 0; i--) {
      const position = pausePoints[i];
      if (position < processedText.length) {
        processedText = processedText.slice(0, position) + "... " + processedText.slice(position);
      }
    }

    return this.speak(processedText);
  }
}
