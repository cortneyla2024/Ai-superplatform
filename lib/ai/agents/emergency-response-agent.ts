import { Agent, AgentResponse } from "../core/agent";
import { UserContext, EmotionalState } from "../core/master-conductor";

export interface Emergency {
  id: string;
  type: "medical" | "mental_health" | "safety" | "financial" | "natural_disaster" | "personal_crisis";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  timestamp: Date;
  location?: string;
  isActive: boolean;
  resolvedAt?: Date;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  isEmergencyContact: boolean;
}

export interface EmergencyProtocol {
  id: string;
  type: Emergency["type"];
  title: string;
  description: string;
  steps: string[];
  priority: "immediate" | "urgent" | "important";
  requiresExternalHelp: boolean;
  externalResources: string[];
}

export interface CrisisResource {
  id: string;
  name: string;
  type: "hotline" | "service" | "organization" | "app";
  category: Emergency["type"];
  description: string;
  contact: string;
  availability: "24/7" | "business_hours" | "appointment";
  isFree: boolean;
  location?: string;
}

export interface SafetyPlan {
  id: string;
  title: string;
  description: string;
  triggers: string[];
  warningSigns: string[];
  copingStrategies: string[];
  emergencyContacts: string[];
  isActive: boolean;
  lastUpdated: Date;
}

export class EmergencyResponseAgent extends Agent {
  private activeEmergencies: Map<string, Emergency> = new Map();
  private emergencyContacts: Map<string, EmergencyContact> = new Map();
  private protocols: Map<string, EmergencyProtocol> = new Map();
  private resources: Map<string, CrisisResource> = new Map();
  private safetyPlans: Map<string, SafetyPlan> = new Map();
  private userLocation: string | null = null;

  constructor() {
    super(
      "emergency-response",
      "Emergency Response Agent",
      "Provides immediate assistance during crises and emergency situations",
      [
        "crisis intervention",
        "emergency protocols",
        "safety planning",
        "resource connection",
        "immediate support",
        "crisis de-escalation",
        "emergency coordination",
      ]
    );

    this.initializeEmergencyResources();
  }

  private initializeEmergencyResources(): void {
    // Initialize sample emergency contacts
    this.emergencyContacts.set("primary-contact", {
      id: "primary-contact",
      name: "Sarah Johnson",
      relationship: "Spouse",
      phone: "+1-555-0123",
      email: "sarah.johnson@email.com",
      isPrimary: true,
      isEmergencyContact: true,
    });

    this.emergencyContacts.set("doctor", {
      id: "doctor",
      name: "Dr. Michael Chen",
      relationship: "Primary Care Physician",
      phone: "+1-555-0456",
      email: "dr.chen@clinic.com",
      isPrimary: false,
      isEmergencyContact: true,
    });

    // Initialize sample emergency protocols
    this.protocols.set("suicidal-thoughts", {
      id: "suicidal-thoughts",
      type: "mental_health",
      title: "Suicidal Thoughts Protocol",
      description: "Immediate response protocol for suicidal thoughts or ideation",
      steps: [
        "Stay with the person and ensure their immediate safety",
        "Remove access to lethal means if possible",
        "Call emergency services (911) immediately",
        "Contact a mental health professional",
        "Call National Suicide Prevention Lifeline: 988",
        "Do not leave the person alone",
      ],
      priority: "immediate",
      requiresExternalHelp: true,
      externalResources: ["911", "988", "Local mental health crisis team"],
    });

    this.protocols.set("panic-attack", {
      id: "panic-attack",
      type: "mental_health",
      title: "Panic Attack Protocol",
      description: "Immediate response for panic attacks",
      steps: [
        "Help the person find a safe, quiet place",
        "Encourage slow, deep breathing",
        "Use grounding techniques (5-4-3-2-1 method)",
        "Stay calm and reassuring",
        "Offer water if available",
        "Monitor for signs of medical emergency",
      ],
      priority: "urgent",
      requiresExternalHelp: false,
      externalResources: ["Mental health professional", "Crisis hotline"],
    });

    this.protocols.set("medical-emergency", {
      id: "medical-emergency",
      type: "medical",
      title: "Medical Emergency Protocol",
      description: "Response protocol for medical emergencies",
      steps: [
        "Assess the situation for immediate danger",
        "Call emergency services (911)",
        "Check for responsiveness and breathing",
        "Begin CPR if trained and necessary",
        "Stay with the person until help arrives",
        "Gather medical information if possible",
      ],
      priority: "immediate",
      requiresExternalHelp: true,
      externalResources: ["911", "Local emergency services"],
    });

    // Initialize sample crisis resources
    this.resources.set("suicide-prevention", {
      id: "suicide-prevention",
      name: "National Suicide Prevention Lifeline",
      type: "hotline",
      category: "mental_health",
      description: "24/7 crisis support for suicidal thoughts",
      contact: "988",
      availability: "24/7",
      isFree: true,
    });

    this.resources.set("crisis-text-line", {
      id: "crisis-text-line",
      name: "Crisis Text Line",
      type: "service",
      category: "mental_health",
      description: "Text-based crisis support",
      contact: "Text HOME to 741741",
      availability: "24/7",
      isFree: true,
    });

    this.resources.set("domestic-violence", {
      id: "domestic-violence",
      name: "National Domestic Violence Hotline",
      type: "hotline",
      category: "safety",
      description: "Support for domestic violence situations",
      contact: "1-800-799-7233",
      availability: "24/7",
      isFree: true,
    });

    // Initialize sample safety plan
    this.safetyPlans.set("mental-health-safety", {
      id: "mental-health-safety",
      title: "Mental Health Safety Plan",
      description: "Personal safety plan for mental health crises",
      triggers: [
        "Feeling overwhelmed at work",
        "Relationship conflicts",
        "Financial stress",
        "Sleep deprivation",
      ],
      warningSigns: [
        "Increased isolation",
        "Changes in sleep patterns",
        "Loss of interest in activities",
        "Thoughts of self-harm",
      ],
      copingStrategies: [
        "Call a trusted friend or family member",
        "Practice deep breathing exercises",
        "Go for a walk in nature",
        "Write in a journal",
        "Listen to calming music",
      ],
      emergencyContacts: ["primary-contact", "doctor"],
      isActive: true,
      lastUpdated: new Date(),
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
      // Analyze emergency needs
      const emergencyNeeds = this.analyzeEmergencyNeeds(input, emotionalState);

      // Generate appropriate response
      const response = await this.generateEmergencyResponse(input, emergencyNeeds, context);

      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(processingTime, response.confidence);

      return response;
    } catch (error) {
      console.error("Emergency Response Agent processing error:", error);
      this.status.errorCount++;

      return {
        content: "I'm here to help you in emergency situations. I'm experiencing some technical difficulties right now, but I can still provide emergency assistance. If this is a life-threatening emergency, please call 911 immediately.",
        confidence: 0.5,
        suggestedActions: ["Call 911", "Get help", "Stay safe"],
        emotionalSupport: emotionalState,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          agentId: this.id,
        },
      };
    }
  }

  private analyzeEmergencyNeeds(input: string, emotionalState: EmotionalState): {
    type: Emergency["type"];
    severity: Emergency["severity"];
    requiresImmediateAction: boolean;
    keywords: string[];
  } {
    const inputLower = input.toLowerCase();

    let type: Emergency["type"] = "personal_crisis";
    let severity: Emergency["severity"] = "medium";
    let requiresImmediateAction = false;
    const keywords: string[] = [];

    // Determine emergency type
    if (inputLower.includes("suicide") || inputLower.includes("kill myself") || inputLower.includes("end it all")) {
      type = "mental_health";
      severity = "critical";
      requiresImmediateAction = true;
    } else if (inputLower.includes("panic") || inputLower.includes("anxiety attack") || inputLower.includes("can't breathe")) {
      type = "mental_health";
      severity = "high";
      requiresImmediateAction = true;
    } else if (inputLower.includes("hurt") || inputLower.includes("pain") || inputLower.includes("bleeding")) {
      type = "medical";
      severity = "high";
      requiresImmediateAction = true;
    } else if (inputLower.includes("danger") || inputLower.includes("threat") || inputLower.includes("unsafe")) {
      type = "safety";
      severity = "high";
      requiresImmediateAction = true;
    } else if (inputLower.includes("money") || inputLower.includes("broke") || inputLower.includes("homeless")) {
      type = "financial";
      severity = "medium";
      requiresImmediateAction = false;
    } else if (inputLower.includes("earthquake") || inputLower.includes("fire") || inputLower.includes("flood")) {
      type = "natural_disaster";
      severity = "high";
      requiresImmediateAction = true;
    }

    // Determine severity based on emotional state and keywords
    if (emotionalState.intensity > 0.9) {
      severity = "critical";
      requiresImmediateAction = true;
    } else if (emotionalState.intensity > 0.7) {
      severity = "high";
      requiresImmediateAction = true;
    } else if (emotionalState.intensity > 0.5) {
      severity = "medium";
    } else {
      severity = "low";
    }

    // Extract emergency keywords
    const emergencyKeywords = [
      "emergency", "crisis", "help", "urgent", "immediate", "danger", "threat",
      "suicide", "kill", "die", "pain", "hurt", "bleeding", "unconscious",
      "panic", "anxiety", "attack", "breathing", "heart", "chest",
      "fire", "flood", "earthquake", "storm", "accident", "injury",
    ];

    emergencyKeywords.forEach(keyword => {
      if (inputLower.includes(keyword)) {
        keywords.push(keyword);
      }
    });

    return { type, severity, requiresImmediateAction, keywords };
  }

  private async generateEmergencyResponse(
    input: string,
    emergencyNeeds: any,
    context: UserContext
  ): Promise<AgentResponse> {
    let content = "";
    let suggestedActions: string[] = [];

    // Handle critical emergencies first
    if (emergencyNeeds.severity === "critical" || emergencyNeeds.requiresImmediateAction) {
      content = await this.generateCriticalEmergencyResponse(emergencyNeeds);
      suggestedActions = ["Call 911", "Get help now", "Stay safe"];
    } else {
      switch (emergencyNeeds.type) {
        case "mental_health":
          content = await this.generateMentalHealthResponse(emergencyNeeds);
          suggestedActions = ["Get support", "Call hotline", "Talk to someone"];
          break;

        case "medical":
          content = await this.generateMedicalResponse(emergencyNeeds);
          suggestedActions = ["Call 911", "Get medical help", "Stay calm"];
          break;

        case "safety":
          content = await this.generateSafetyResponse(emergencyNeeds);
          suggestedActions = ["Get to safety", "Call authorities", "Contact support"];
          break;

        case "financial":
          content = await this.generateFinancialResponse(emergencyNeeds);
          suggestedActions = ["Get financial help", "Find resources", "Make plan"];
          break;

        case "natural_disaster":
          content = await this.generateNaturalDisasterResponse(emergencyNeeds);
          suggestedActions = ["Follow evacuation", "Stay informed", "Get to safety"];
          break;

        default:
          content = await this.generateGeneralEmergencyResponse(emergencyNeeds);
          suggestedActions = ["Get help", "Stay safe", "Contact support"];
      }
    }

    // Add immediate action warning for critical situations
    if (emergencyNeeds.severity === "critical") {
      content = `🚨 CRITICAL EMERGENCY: ${content}`;
      content += " If you are in immediate danger, please call 911 or your local emergency services right now.";
    }

    return {
      content,
      confidence: 0.9,
      suggestedActions,
      emotionalSupport: {
        primary: "calming",
        intensity: 0.8,
        valence: 0.3,
        arousal: 0.7,
        confidence: 0.9,
        timestamp: new Date(),
      },
      metadata: {
        emergencyNeeds,
        activeEmergencies: this.activeEmergencies.size,
        emergencyContacts: this.emergencyContacts.size,
        protocols: this.protocols.size,
        resources: this.resources.size,
        agentId: this.id,
      },
    };
  }

  private async generateCriticalEmergencyResponse(emergencyNeeds: any): Promise<string> {
    let content = "I understand you're in a critical situation. Your safety is the most important thing right now. ";

    content += "Please take these immediate steps: ";
    content += "1. If you're in immediate danger, call 911 or your local emergency services ";
    content += "2. Get to a safe location if possible ";
    content += "3. Stay on the line with emergency services ";
    content += "4. Follow their instructions carefully ";

    if (emergencyNeeds.type === "mental_health") {
      content += "For mental health crises, you can also call the National Suicide Prevention Lifeline at 988 (available 24/7). ";
    }

    content += "I'm here to support you, but professional emergency services are best equipped to help in critical situations. ";
    content += "Please prioritize your safety and get the help you need.";

    return content;
  }

  private async generateMentalHealthResponse(emergencyNeeds: any): Promise<string> {
    let content = "I hear that you're struggling, and I want you to know that you're not alone. ";

    const mentalHealthResources = Array.from(this.resources.values())
      .filter(resource => resource.category === "mental_health")
      .slice(0, 2);

    if (mentalHealthResources.length > 0) {
      content += "Here are some resources that can help: ";
      mentalHealthResources.forEach(resource => {
        content += `• ${resource.name}: ${resource.contact} - ${resource.description}, `;
      });
      content = content.slice(0, -2) + ". ";
    }

    const safetyPlan = Array.from(this.safetyPlans.values())
      .find(plan => plan.isActive);

    if (safetyPlan) {
      content += "You have an active safety plan with coping strategies. ";
      content += `Consider trying: ${safetyPlan.copingStrategies.slice(0, 2).join(", ")}. `;
    }

    content += "It's okay to ask for help, and there are people who want to support you. ";
    content += "Would you like me to help you connect with professional support?";

    return content;
  }

  private async generateMedicalResponse(emergencyNeeds: any): Promise<string> {
    let content = "Your health and safety are the priority right now. ";

    if (emergencyNeeds.severity === "high") {
      content += "This sounds like it could be a medical emergency. ";
      content += "Please call 911 or go to the nearest emergency room immediately. ";
    }

    const medicalProtocol = Array.from(this.protocols.values())
      .find(protocol => protocol.type === "medical");

    if (medicalProtocol) {
      content += "Here are the immediate steps to take: ";
      medicalProtocol.steps.slice(0, 3).forEach((step, index) => {
        content += `${index + 1}. ${step} `;
      });
    }

    content += "Don't hesitate to seek medical attention - it's always better to be safe than sorry. ";
    content += "Would you like me to help you find the nearest medical facility?";

    return content;
  }

  private async generateSafetyResponse(emergencyNeeds: any): Promise<string> {
    let content = "Your safety is the most important thing. ";

    if (emergencyNeeds.severity === "high") {
      content += "If you're in immediate danger, please call 911 or your local emergency services right now. ";
    }

    const safetyResources = Array.from(this.resources.values())
      .filter(resource => resource.category === "safety")
      .slice(0, 2);

    if (safetyResources.length > 0) {
      content += "Here are some safety resources: ";
      safetyResources.forEach(resource => {
        content += `• ${resource.name}: ${resource.contact} - ${resource.description}, `;
      });
      content = content.slice(0, -2) + ". ";
    }

    content += "If you can safely do so, try to: ";
    content += "• Get to a safe location ";
    content += "• Contact someone you trust ";
    content += "• Document what happened if possible ";
    content += "• Seek professional help ";

    content += "You deserve to feel safe and supported. ";
    content += "What would help you feel safer right now?";

    return content;
  }

  private async generateFinancialResponse(emergencyNeeds: any): Promise<string> {
    let content = "Financial stress can be overwhelming, but there are resources to help. ";

    content += "Here are some immediate steps you can take: ";
    content += "• Contact your creditors to discuss payment options ";
    content += "• Look into local assistance programs ";
    content += "• Consider speaking with a financial counselor ";
    content += "• Check if you qualify for emergency assistance ";

    content += "Many organizations offer free financial counseling and emergency assistance. ";
    content += "Would you like me to help you find local financial resources?";

    return content;
  }

  private async generateNaturalDisasterResponse(emergencyNeeds: any): Promise<string> {
    let content = "During natural disasters, your safety is the top priority. ";

    content += "Please follow these safety guidelines: ";
    content += "• Follow official evacuation orders if given ";
    content += "• Stay informed through official sources ";
    content += "• Have an emergency kit ready ";
    content += "• Know your evacuation route ";
    content += "• Stay away from dangerous areas ";

    content += "Listen to local authorities and emergency broadcasts for the most current information. ";
    content += "Are you in a safe location right now?";

    return content;
  }

  private async generateGeneralEmergencyResponse(emergencyNeeds: any): Promise<string> {
    let content = "I understand you're going through a difficult situation. ";

    content += "Here are some general steps that might help: ";
    content += "• Take deep breaths and try to stay calm ";
    content += "• Assess if you're in immediate danger ";
    content += "• Contact someone you trust ";
    content += "• Seek professional help if needed ";
    content += "• Remember that this situation is temporary ";

    content += "You don't have to face this alone. ";
    content += "What kind of support would be most helpful right now?";

    return content;
  }

  async createEmergency(emergencyData: Omit<Emergency, "id" | "timestamp">): Promise<Emergency> {
    const id = `emergency-${Date.now()}`;
    const emergency: Emergency = { ...emergencyData, id, timestamp: new Date() };
    this.activeEmergencies.set(id, emergency);
    return emergency;
  }

  async resolveEmergency(emergencyId: string): Promise<boolean> {
    const emergency = this.activeEmergencies.get(emergencyId);
    if (emergency) {
      emergency.isActive = false;
      emergency.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  async getActiveEmergencies(): Promise<Emergency[]> {
    return Array.from(this.activeEmergencies.values())
      .filter(emergency => emergency.isActive);
  }

  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return Array.from(this.emergencyContacts.values());
  }

  async getProtocols(type?: Emergency["type"]): Promise<EmergencyProtocol[]> {
    const protocols = Array.from(this.protocols.values());
    return type ? protocols.filter(protocol => protocol.type === type) : protocols;
  }

  async getResources(category?: Emergency["type"]): Promise<CrisisResource[]> {
    const resources = Array.from(this.resources.values());
    return category ? resources.filter(resource => resource.category === category) : resources;
  }

  async getSafetyPlans(): Promise<SafetyPlan[]> {
    return Array.from(this.safetyPlans.values())
      .filter(plan => plan.isActive);
  }

  async addEmergencyContact(contactData: Omit<EmergencyContact, "id">): Promise<EmergencyContact> {
    const id = `contact-${Date.now()}`;
    const contact: EmergencyContact = { ...contactData, id };
    this.emergencyContacts.set(id, contact);
    return contact;
  }

  async createSafetyPlan(planData: Omit<SafetyPlan, "id" | "lastUpdated">): Promise<SafetyPlan> {
    const id = `plan-${Date.now()}`;
    const plan: SafetyPlan = { ...planData, id, lastUpdated: new Date() };
    this.safetyPlans.set(id, plan);
    return plan;
  }

  async updateUserLocation(location: string): Promise<void> {
    this.userLocation = location;
  }

  async getLocalEmergencyServices(): Promise<string[]> {
    // In a real implementation, this would integrate with location services
    // to provide local emergency numbers and services
    return ["911", "Local police", "Local fire department", "Local hospital"];
  }
}
