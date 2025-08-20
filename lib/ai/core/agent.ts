import { UserContext, EmotionalState } from "./master-conductor";

export interface AgentStatus {
  isActive: boolean;
  lastActivity: Date;
  performanceMetrics: {
    responseTime: number;
    accuracy: number;
    userSatisfaction: number;
  };
  memoryUsage: number;
  errorCount: number;
}

export interface AgentResponse {
  content: string;
  confidence: number;
  suggestedActions: string[];
  emotionalSupport?: EmotionalState;
  metadata: Record<string, any>;
}

export abstract class Agent {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly capabilities: string[];

  protected status: AgentStatus;
  protected memory: Map<string, any> = new Map();
  protected learningHistory: Array<{
    input: string;
    response: AgentResponse;
    userFeedback?: number;
    timestamp: Date;
  }> = [];

  constructor(id: string, name: string, description: string, capabilities: string[]) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.capabilities = capabilities;
    this.status = {
      isActive: true,
      lastActivity: new Date(),
      performanceMetrics: {
        responseTime: 0,
        accuracy: 0.8,
        userSatisfaction: 0.8,
      },
      memoryUsage: 0,
      errorCount: 0,
    };
  }

  abstract async process(
    input: string,
    context: UserContext,
    emotionalState: EmotionalState
  ): Promise<AgentResponse>;

  async learn(feedback: number, input: string, response: AgentResponse): Promise<void> {
    this.learningHistory.push({
      input,
      response,
      userFeedback: feedback,
      timestamp: new Date(),
    });

    // Update performance metrics
    this.status.performanceMetrics.userSatisfaction =
      (this.status.performanceMetrics.userSatisfaction + feedback) / 2;

    // Implement continuous learning logic
    await this.adaptToFeedback(feedback, input, response);
  }

  protected async adaptToFeedback(
    feedback: number,
    input: string,
    response: AgentResponse
  ): Promise<void> {
    // Override in subclasses for specific learning behavior
    if (feedback < 0.5) {
      // Poor feedback - analyze and improve
      await this.analyzeFailure(input, response);
    } else if (feedback > 0.8) {
      // Good feedback - reinforce successful patterns
      await this.reinforceSuccess(input, response);
    }
  }

  protected async analyzeFailure(input: string, response: AgentResponse): Promise<void> {
    // Analyze what went wrong and update strategies
    console.log(`Agent ${this.id} analyzing failure for input: ${input}`);
  }

  protected async reinforceSuccess(input: string, response: AgentResponse): Promise<void> {
    // Reinforce successful response patterns
    console.log(`Agent ${this.id} reinforcing success for input: ${input}`);
  }

  getStatus(): AgentStatus {
    return { ...this.status };
  }

  getLastActivity(): Date {
    return this.status.lastActivity;
  }

  protected updateActivity(): void {
    this.status.lastActivity = new Date();
  }

  protected updatePerformanceMetrics(responseTime: number, accuracy: number): void {
    this.status.performanceMetrics.responseTime = responseTime;
    this.status.performanceMetrics.accuracy = accuracy;
  }

  async selfDiagnose(): Promise<{
    health: "excellent" | "good" | "fair" | "poor";
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check performance metrics
    if (this.status.performanceMetrics.accuracy < 0.7) {
      issues.push("Low accuracy detected");
      recommendations.push("Review recent interactions and update response patterns");
    }

    if (this.status.performanceMetrics.userSatisfaction < 0.6) {
      issues.push("Low user satisfaction");
      recommendations.push("Analyze user feedback and improve response quality");
    }

    if (this.status.errorCount > 5) {
      issues.push("High error count");
      recommendations.push("Review error logs and implement fixes");
    }

    // Determine overall health
    let health: "excellent" | "good" | "fair" | "poor" = "excellent";
    if (issues.length === 0) {
      health = "excellent";
    } else if (issues.length <= 2) {
      health = "good";
    } else if (issues.length <= 4) {
      health = "fair";
    } else {
      health = "poor";
    }

    return { health, issues, recommendations };
  }

  async optimize(): Promise<void> {
    // Implement agent-specific optimization
    const diagnosis = await this.selfDiagnose();

    if (diagnosis.health === "poor") {
      await this.emergencyOptimization();
    } else if (diagnosis.health === "fair") {
      await this.standardOptimization();
    }
  }

  protected async emergencyOptimization(): Promise<void> {
    // Implement emergency optimization procedures
    console.log(`Agent ${this.id} performing emergency optimization`);
  }

  protected async standardOptimization(): Promise<void> {
    // Implement standard optimization procedures
    console.log(`Agent ${this.id} performing standard optimization`);
  }

  protected getMemory(key: string): any {
    return this.memory.get(key);
  }

  protected setMemory(key: string, value: any): void {
    this.memory.set(key, value);
    this.status.memoryUsage = this.memory.size;
  }

  protected clearMemory(): void {
    this.memory.clear();
    this.status.memoryUsage = 0;
  }
}
