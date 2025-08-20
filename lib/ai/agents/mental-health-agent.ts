import { Agent, AgentResponse } from "../core/agent";
import { UserContext, EmotionalState } from "../core/master-conductor";

export interface MentalHealthAssessment {
  condition: string;
  severity: "mild" | "moderate" | "severe";
  symptoms: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  recommendations: string[];
  professionalHelp: boolean;
  emergencyContact?: string;
}

export interface TherapySession {
  type: "cbt" | "dbt" | "emdr" | "mindfulness" | "exposure" | "interpersonal";
  duration: number;
  exercises: TherapyExercise[];
  progress: number;
  nextSession?: Date;
}

export interface TherapyExercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  instructions: string[];
  expectedOutcome: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export class MentalHealthAgent extends Agent {
  private conditions: Map<string, any> = new Map();
  private therapyTypes: Map<string, any> = new Map();
  private crisisProtocols: Map<string, any> = new Map();
  private userAssessments: Map<string, MentalHealthAssessment> = new Map();

  constructor() {
    super(
      "mental-health",
      "Mental Health Support Agent",
      "Provides comprehensive mental health support, assessment, and therapy guidance",
      [
        "mental health assessment",
        "crisis intervention",
        "therapy guidance",
        "symptom tracking",
        "coping strategies",
        "professional referrals",
      ]
    );

    this.initializeMentalHealthResources();
  }

  private initializeMentalHealthResources(): void {
    // Initialize mental health conditions database
    this.conditions.set("depression", {
      name: "Major Depressive Disorder",
      symptoms: [
        "Persistent sad, anxious, or \"empty\" mood",
        "Loss of interest or pleasure in hobbies and activities",
        "Decreased energy, fatigue, feeling \"slowed down\"",
        "Difficulty concentrating, remembering, or making decisions",
        "Insomnia, early-morning awakening, or oversleeping",
        "Appetite and/or weight changes",
        "Thoughts of death or suicide, or suicide attempts",
      ],
      severityLevels: {
        mild: "Some symptoms present, minimal functional impairment",
        moderate: "Multiple symptoms, noticeable functional impairment",
        severe: "Many symptoms, significant functional impairment",
      },
      treatments: ["CBT", "Medication", "Lifestyle changes", "Support groups"],
    });

    this.conditions.set("anxiety", {
      name: "Generalized Anxiety Disorder",
      symptoms: [
        "Excessive anxiety and worry about various activities or events",
        "Difficulty controlling worry",
        "Restlessness or feeling keyed up or on edge",
        "Being easily fatigued",
        "Difficulty concentrating or mind going blank",
        "Irritability",
        "Muscle tension",
        "Sleep problems",
      ],
      severityLevels: {
        mild: "Some anxiety symptoms, manageable",
        moderate: "Regular anxiety, some interference with daily life",
        severe: "Constant anxiety, significant life interference",
      },
      treatments: ["CBT", "Mindfulness", "Medication", "Relaxation techniques"],
    });

    this.conditions.set("ptsd", {
      name: "Post-Traumatic Stress Disorder",
      symptoms: [
        "Intrusive memories or flashbacks",
        "Avoidance of reminders of the trauma",
        "Negative changes in thinking and mood",
        "Changes in physical and emotional reactions",
        "Hypervigilance",
        "Sleep disturbances",
        "Irritability or aggressive behavior",
      ],
      severityLevels: {
        mild: "Some symptoms, manageable with support",
        moderate: "Regular symptoms, some life interference",
        severe: "Frequent symptoms, significant impairment",
      },
      treatments: ["EMDR", "CBT", "Medication", "Support groups"],
    });

    // Initialize therapy types
    this.therapyTypes.set("cbt", {
      name: "Cognitive Behavioral Therapy",
      description: "A structured, time-limited therapy that focuses on identifying and changing negative thought patterns and behaviors.",
      techniques: [
        "Thought challenging",
        "Behavioral activation",
        "Exposure therapy",
        "Problem-solving skills",
        "Relaxation techniques",
      ],
      exercises: [
        {
          id: "cbt-thought-record",
          name: "Thought Record",
          description: "Identify and challenge negative thoughts",
          duration: 15,
          instructions: [
            "Write down the situation that triggered your thoughts",
            "Record your automatic thoughts",
            "Identify emotions and their intensity",
            "Challenge your thoughts with evidence",
            "Develop more balanced thoughts",
          ],
          expectedOutcome: "Reduced negative thinking patterns",
          difficulty: "beginner",
        },
      ],
    });

    this.therapyTypes.set("mindfulness", {
      name: "Mindfulness-Based Therapy",
      description: "Focuses on present-moment awareness and acceptance of thoughts and feelings.",
      techniques: [
        "Meditation",
        "Breathing exercises",
        "Body scanning",
        "Mindful walking",
        "Loving-kindness meditation",
      ],
      exercises: [
        {
          id: "mindfulness-breathing",
          name: "Mindful Breathing",
          description: "Focus on your breath to center yourself",
          duration: 10,
          instructions: [
            "Find a comfortable position",
            "Close your eyes or focus on a point",
            "Breathe naturally and observe your breath",
            "When your mind wanders, gently return to your breath",
            "Continue for the full duration",
          ],
          expectedOutcome: "Reduced stress and increased calm",
          difficulty: "beginner",
        },
      ],
    });

    // Initialize crisis protocols
    this.crisisProtocols.set("suicidal_thoughts", {
      riskLevel: "critical",
      immediateActions: [
        "Stay with the person if possible",
        "Remove access to harmful objects",
        "Call emergency services immediately",
        "Contact a mental health professional",
        "Use crisis hotlines",
      ],
      emergencyContacts: [
        "National Suicide Prevention Lifeline: 988",
        "Crisis Text Line: Text HOME to 741741",
        "Emergency Services: 911",
      ],
      followUp: [
        "Professional mental health evaluation",
        "Safety planning",
        "Regular check-ins",
        "Support system involvement",
      ],
    });

    this.crisisProtocols.set("panic_attack", {
      riskLevel: "high",
      immediateActions: [
        "Help the person find a safe, quiet place",
        "Encourage slow, deep breathing",
        "Use grounding techniques",
        "Stay calm and reassuring",
        "Monitor for medical symptoms",
      ],
      emergencyContacts: [
        "Mental health crisis line",
        "Primary care physician",
        "Emergency services if severe",
      ],
      followUp: [
        "Professional evaluation",
        "Anxiety management techniques",
        "Regular therapy sessions",
      ],
    });
  }

  async process(
    input: string,
    context: UserContext,
    emotionalState: EmotionalState
  ): Promise<AgentResponse> {
    this.updateActivity();
    const startTime = Date.now();

    try {
      // Check for crisis indicators first
      const crisisAssessment = this.assessCrisisRisk(input, emotionalState);
      if (crisisAssessment.riskLevel === "critical") {
        return this.handleCrisis(input, crisisAssessment);
      }

      // Assess mental health condition
      const assessment = await this.assessMentalHealth(input, emotionalState, context);

      // Generate appropriate response
      const response = await this.generateMentalHealthResponse(input, assessment, context);

      // Update user assessment
      if (assessment.condition) {
        this.userAssessments.set(context.userId || "default", assessment);
      }

      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(processingTime, response.confidence);

      return response;
    } catch (error) {
      console.error("Mental Health Agent processing error:", error);
      this.status.errorCount++;

      return {
        content: "I'm here to support you with your mental health. I'm experiencing some technical difficulties right now, but I want you to know that you're not alone. If you're in crisis, please call the National Suicide Prevention Lifeline at 988 or text HOME to 741741 to reach the Crisis Text Line.",
        confidence: 0.5,
        suggestedActions: ["Contact crisis hotline", "Seek professional help", "Talk to a trusted person"],
        emotionalSupport: emotionalState,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          agentId: this.id,
        },
      };
    }
  }

  private assessCrisisRisk(input: string, emotionalState: EmotionalState): {
    riskLevel: "low" | "medium" | "high" | "critical";
    indicators: string[];
    protocol: any;
  } {
    const crisisKeywords = {
      suicidal: ["suicide", "kill myself", "end it all", "want to die", "better off dead"],
      self_harm: ["hurt myself", "cut myself", "self harm", "self injury"],
      panic: ["panic", "can't breathe", "heart attack", "dying", "losing control"],
      psychosis: ["hearing voices", "seeing things", "paranoid", "delusions"],
    };

    const indicators: string[] = [];
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";

    // Check for suicidal thoughts
    if (crisisKeywords.suicidal.some(keyword => input.toLowerCase().includes(keyword))) {
      indicators.push("suicidal_thoughts");
      riskLevel = "critical";
    }

    // Check for self-harm
    if (crisisKeywords.self_harm.some(keyword => input.toLowerCase().includes(keyword))) {
      indicators.push("self_harm");
      riskLevel = riskLevel === "critical" ? "critical" : "high";
    }

    // Check for panic attack
    if (crisisKeywords.panic.some(keyword => input.toLowerCase().includes(keyword))) {
      indicators.push("panic_attack");
      riskLevel = riskLevel === "critical" ? "critical" : "high";
    }

    // Check emotional state
    if (emotionalState.intensity > 0.9 && emotionalState.valence < 0.2) {
      indicators.push("extreme_emotional_distress");
      riskLevel = riskLevel === "critical" ? "critical" : "high";
    }

    const protocol = indicators.length > 0 ? this.crisisProtocols.get(indicators[0]) : null;

    return { riskLevel, indicators, protocol };
  }

  private handleCrisis(input: string, crisisAssessment: any): AgentResponse {
    const protocol = crisisAssessment.protocol;

    return {
      content: `I'm very concerned about what you're sharing. Your safety is the most important thing right now. ${protocol ? protocol.immediateActions[0] : "Please call the National Suicide Prevention Lifeline at 988 immediately."} You're not alone, and there are people who want to help you. ${protocol?.emergencyContacts?.[0] || "Call 988 or text HOME to 741741 for immediate support."}`,
      confidence: 0.9,
      suggestedActions: protocol?.immediateActions || [
        "Call 988 (Suicide Prevention Lifeline)",
        "Text HOME to 741741 (Crisis Text Line)",
        "Call 911 if immediate danger",
        "Contact a mental health professional",
      ],
      emotionalSupport: {
        primary: "concerned",
        intensity: 0.9,
        valence: 0.1,
        arousal: 0.8,
        confidence: 0.9,
        timestamp: new Date(),
      },
      metadata: {
        crisisLevel: crisisAssessment.riskLevel,
        indicators: crisisAssessment.indicators,
        emergencyContacts: protocol?.emergencyContacts,
        agentId: this.id,
      },
    };
  }

  private async assessMentalHealth(
    input: string,
    emotionalState: EmotionalState,
    context: UserContext
  ): Promise<MentalHealthAssessment> {
    const symptoms = this.extractSymptoms(input);
    const condition = this.identifyCondition(symptoms, emotionalState);
    const severity = this.assessSeverity(symptoms, emotionalState);
    const riskLevel = this.assessRiskLevel(condition, severity, emotionalState);

    const recommendations = this.generateRecommendations(condition, severity, riskLevel);
    const professionalHelp = riskLevel === "high" || severity === "severe";

    return {
      condition: condition?.name || "general_mental_health",
      severity,
      symptoms,
      riskLevel,
      recommendations,
      professionalHelp,
      emergencyContact: riskLevel === "critical" ? "988" : undefined,
    };
  }

  private extractSymptoms(input: string): string[] {
    const allSymptoms: string[] = [];

    // Extract symptoms from input text
    this.conditions.forEach((condition, key) => {
      condition.symptoms.forEach((symptom: string) => {
        const symptomKeywords = symptom.toLowerCase().split(/\s+/);
        if (symptomKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
          allSymptoms.push(symptom);
        }
      });
    });

    return allSymptoms;
  }

  private identifyCondition(symptoms: string[], emotionalState: EmotionalState): any {
    let bestMatch = null;
    let highestScore = 0;

    this.conditions.forEach((condition, key) => {
      const matchingSymptoms = condition.symptoms.filter((symptom: string) =>
        symptoms.includes(symptom)
      );

      const score = matchingSymptoms.length / condition.symptoms.length;

      // Adjust score based on emotional state
      let adjustedScore = score;
      if (key === "depression" && emotionalState.valence < 0.3) {
        adjustedScore *= 1.2;
      }
      if (key === "anxiety" && emotionalState.arousal > 0.7) {
        adjustedScore *= 1.2;
      }

      if (adjustedScore > highestScore) {
        highestScore = adjustedScore;
        bestMatch = condition;
      }
    });

    return bestMatch;
  }

  private assessSeverity(symptoms: string[], emotionalState: EmotionalState): "mild" | "moderate" | "severe" {
    const symptomCount = symptoms.length;
    const emotionalIntensity = emotionalState.intensity;

    if (symptomCount >= 5 || emotionalIntensity > 0.8) {
      return "severe";
    } else if (symptomCount >= 3 || emotionalIntensity > 0.6) {
      return "moderate";
    } else {
      return "mild";
    }
  }

  private assessRiskLevel(condition: any, severity: string, emotionalState: EmotionalState): "low" | "medium" | "high" | "critical" {
    // Check for immediate risk factors
    if (emotionalState.intensity > 0.9 && emotionalState.valence < 0.1) {
      return "critical";
    }

    if (severity === "severe" || emotionalState.intensity > 0.8) {
      return "high";
    }

    if (severity === "moderate" || emotionalState.intensity > 0.6) {
      return "medium";
    }

    return "low";
  }

  private generateRecommendations(condition: any, severity: string, riskLevel: string): string[] {
    const recommendations: string[] = [];

    if (condition) {
      recommendations.push(`Consider learning more about ${condition.name}`);
      recommendations.push(`Explore ${condition.treatments.join(", ")} as treatment options`);
    }

    if (severity === "severe" || riskLevel === "high") {
      recommendations.push("Seek professional mental health evaluation");
      recommendations.push("Consider medication consultation with a psychiatrist");
    }

    if (severity === "moderate") {
      recommendations.push("Consider therapy or counseling");
      recommendations.push("Practice self-care and stress management");
    }

    recommendations.push("Build a support network of trusted friends and family");
    recommendations.push("Maintain regular sleep, exercise, and nutrition");

    return recommendations;
  }

  private async generateMentalHealthResponse(
    input: string,
    assessment: MentalHealthAssessment,
    context: UserContext
  ): Promise<AgentResponse> {
    let content = "";
    let suggestedActions: string[] = [];

    if (assessment.condition && assessment.condition !== "general_mental_health") {
      content = `I understand you're experiencing some challenges with ${assessment.condition}. Based on what you've shared, I can see ${assessment.symptoms.length} symptoms that align with this condition. The severity appears to be ${assessment.severity}. `;

      if (assessment.professionalHelp) {
        content += `Given the ${assessment.severity} nature of your symptoms, I strongly recommend seeking professional mental health support. `;
      }

      content += `Here are some things that might help: ${assessment.recommendations.slice(0, 3).join(", ")}. `;

      suggestedActions = assessment.recommendations.slice(0, 3);
    } else {
      content = "I hear that you're going through a difficult time. It's completely normal to experience mental health challenges, and it's brave of you to reach out. ";

      if (assessment.symptoms.length > 0) {
        content += `I notice you're experiencing some symptoms like ${assessment.symptoms.slice(0, 2).join(" and ")}. `;
      }

      content += `Here are some general recommendations that might help: ${assessment.recommendations.slice(0, 3).join(", ")}. `;

      suggestedActions = assessment.recommendations.slice(0, 3);
    }

    content += "Remember, you're not alone in this. There are people who care about you and want to help. If you ever feel like you're in crisis, please don't hesitate to reach out to a crisis hotline or emergency services.";

    return {
      content,
      confidence: 0.8,
      suggestedActions,
      emotionalSupport: {
        primary: "supportive",
        intensity: 0.7,
        valence: 0.6,
        arousal: 0.4,
        confidence: 0.8,
        timestamp: new Date(),
      },
      metadata: {
        assessment,
        condition: assessment.condition,
        severity: assessment.severity,
        riskLevel: assessment.riskLevel,
        agentId: this.id,
      },
    };
  }

  async getTherapySession(type: string): Promise<TherapySession | null> {
    const therapyType = this.therapyTypes.get(type);
    if (!therapyType) {
return null;
}

    return {
      type: type as any,
      duration: 45,
      exercises: therapyType.exercises,
      progress: 0,
    };
  }

  async getCopingStrategies(condition: string): Promise<string[]> {
    const conditionData = this.conditions.get(condition);
    if (!conditionData) {
return [];
}

    const strategies: string[] = [
      "Practice deep breathing exercises",
      "Engage in regular physical activity",
      "Maintain a consistent sleep schedule",
      "Connect with supportive friends and family",
      "Practice mindfulness or meditation",
      "Keep a mood journal",
      "Limit alcohol and caffeine intake",
      "Set small, achievable goals",
    ];

    return strategies;
  }

  getUserAssessment(userId: string): MentalHealthAssessment | undefined {
    return this.userAssessments.get(userId);
  }

  async trackProgress(userId: string, metrics: {
    mood: number;
    anxiety: number;
    sleep: number;
    energy: number;
  }): Promise<void> {
    const assessment = this.userAssessments.get(userId);
    if (assessment) {
      // Update assessment based on progress metrics
      console.log(`Tracking progress for user ${userId}:`, metrics);
    }
  }
}
