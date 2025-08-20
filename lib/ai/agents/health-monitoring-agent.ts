import { Agent, AgentResponse } from "../core/agent";
import { UserContext, EmotionalState } from "../core/master-conductor";

export interface HealthMetric {
  id: string;
  type: "heart_rate" | "blood_pressure" | "sleep" | "steps" | "weight" | "mood" | "energy" | "hydration" | "nutrition" | "exercise";
  value: number;
  unit: string;
  timestamp: Date;
  notes?: string;
}

export interface HealthGoal {
  id: string;
  type: HealthMetric["type"];
  target: number;
  current: number;
  unit: string;
  deadline?: Date;
  isActive: boolean;
  progress: number; // percentage
}

export interface HealthAlert {
  id: string;
  type: "warning" | "critical" | "reminder" | "achievement";
  title: string;
  message: string;
  metricType?: HealthMetric["type"];
  severity: "low" | "medium" | "high";
  timestamp: Date;
  isRead: boolean;
}

export interface WellnessRecommendation {
  id: string;
  category: "exercise" | "nutrition" | "sleep" | "stress" | "prevention";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  estimatedImpact: number; // 0-100
  timeRequired: number; // in minutes
}

export class HealthMonitoringAgent extends Agent {
  private healthMetrics: Map<string, HealthMetric[]> = new Map();
  private healthGoals: Map<string, HealthGoal> = new Map();
  private healthAlerts: Map<string, HealthAlert> = new Map();
  private recommendations: Map<string, WellnessRecommendation> = new Map();
  private userHealthProfile: Map<string, any> = new Map();

  constructor() {
    super(
      "health-monitoring",
      "Health Monitoring Agent",
      "Tracks health metrics and provides wellness insights",
      [
        "health tracking",
        "wellness monitoring",
        "health alerts",
        "fitness goals",
        "nutrition guidance",
        "sleep optimization",
        "stress management",
      ]
    );

    this.initializeHealthResources();
  }

  private initializeHealthResources(): void {
    // Initialize sample health metrics
    const userId = "default-user";
    this.healthMetrics.set(userId, [
      {
        id: "hr-1",
        type: "heart_rate",
        value: 72,
        unit: "bpm",
        timestamp: new Date(),
        notes: "Resting heart rate",
      },
      {
        id: "sleep-1",
        type: "sleep",
        value: 7.5,
        unit: "hours",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        notes: "Good quality sleep",
      },
      {
        id: "steps-1",
        type: "steps",
        value: 8500,
        unit: "steps",
        timestamp: new Date(),
        notes: "Daily step count",
      },
    ]);

    // Initialize sample health goals
    this.healthGoals.set("steps-goal", {
      id: "steps-goal",
      type: "steps",
      target: 10000,
      current: 8500,
      unit: "steps",
      isActive: true,
      progress: 85,
    });

    this.healthGoals.set("sleep-goal", {
      id: "sleep-goal",
      type: "sleep",
      target: 8,
      current: 7.5,
      unit: "hours",
      isActive: true,
      progress: 94,
    });

    this.healthGoals.set("weight-goal", {
      id: "weight-goal",
      type: "weight",
      target: 70,
      current: 72,
      unit: "kg",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
      progress: 60,
    });

    // Initialize sample health alerts
    this.healthAlerts.set("hydration-reminder", {
      id: "hydration-reminder",
      type: "reminder",
      title: "Stay Hydrated",
      message: "You haven't logged water intake today. Remember to drink 8 glasses of water.",
      metricType: "hydration",
      severity: "low",
      timestamp: new Date(),
      isRead: false,
    });

    this.healthAlerts.set("steps-achievement", {
      id: "steps-achievement",
      type: "achievement",
      title: "Great Progress!",
      message: "You're at 85% of your daily step goal. Keep it up!",
      metricType: "steps",
      severity: "low",
      timestamp: new Date(),
      isRead: false,
    });

    // Initialize sample recommendations
    this.recommendations.set("morning-walk", {
      id: "morning-walk",
      category: "exercise",
      title: "Morning Walk",
      description: "Start your day with a 20-minute walk to boost energy and mood",
      priority: "medium",
      estimatedImpact: 75,
      timeRequired: 20,
    });

    this.recommendations.set("sleep-hygiene", {
      id: "sleep-hygiene",
      category: "sleep",
      title: "Improve Sleep Hygiene",
      description: "Create a consistent bedtime routine and avoid screens 1 hour before sleep",
      priority: "high",
      estimatedImpact: 85,
      timeRequired: 5,
    });

    this.recommendations.set("stress-break", {
      id: "stress-break",
      category: "stress",
      title: "Take a Stress Break",
      description: "Practice 5 minutes of deep breathing to reduce stress levels",
      priority: "medium",
      estimatedImpact: 60,
      timeRequired: 5,
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
      // Analyze health monitoring needs
      const healthNeeds = this.analyzeHealthNeeds(input, emotionalState);

      // Generate appropriate response
      const response = await this.generateHealthResponse(input, healthNeeds, context);

      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(processingTime, response.confidence);

      return response;
    } catch (error) {
      console.error("Health Monitoring Agent processing error:", error);
      this.status.errorCount++;

      return {
        content: "I'm here to help you monitor your health and wellness. I'm experiencing some technical difficulties right now, but I can still assist you with your health needs.",
        confidence: 0.5,
        suggestedActions: ["View health metrics", "Check goals", "Get recommendations"],
        emotionalSupport: emotionalState,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          agentId: this.id,
        },
      };
    }
  }

  private analyzeHealthNeeds(input: string, emotionalState: EmotionalState): {
    type: "tracking" | "goals" | "alerts" | "recommendations" | "insights" | "wellness";
    urgency: "low" | "medium" | "high";
    metrics: HealthMetric["type"][];
  } {
    const inputLower = input.toLowerCase();

    let type: "tracking" | "goals" | "alerts" | "recommendations" | "insights" | "wellness" = "tracking";
    let urgency: "low" | "medium" | "high" = "medium";
    const metrics: HealthMetric["type"][] = [];

    // Determine type of health need
    if (inputLower.includes("track") || inputLower.includes("log") || inputLower.includes("record")) {
      type = "tracking";
    } else if (inputLower.includes("goal") || inputLower.includes("target") || inputLower.includes("progress")) {
      type = "goals";
    } else if (inputLower.includes("alert") || inputLower.includes("warning") || inputLower.includes("reminder")) {
      type = "alerts";
    } else if (inputLower.includes("recommend") || inputLower.includes("suggest") || inputLower.includes("advice")) {
      type = "recommendations";
    } else if (inputLower.includes("insight") || inputLower.includes("analysis") || inputLower.includes("trend")) {
      type = "insights";
    } else if (inputLower.includes("wellness") || inputLower.includes("health") || inputLower.includes("fitness")) {
      type = "wellness";
    }

    // Determine urgency based on emotional state and keywords
    if (inputLower.includes("urgent") || inputLower.includes("emergency") || inputLower.includes("pain")) {
      urgency = "high";
    } else if (emotionalState.intensity > 0.8) {
      urgency = "high";
    } else if (inputLower.includes("concern") || inputLower.includes("worried")) {
      urgency = "medium";
    } else {
      urgency = "low";
    }

    // Extract specific metrics
    const metricKeywords = [
      { keyword: "heart", metric: "heart_rate" },
      { keyword: "blood pressure", metric: "blood_pressure" },
      { keyword: "sleep", metric: "sleep" },
      { keyword: "step", metric: "steps" },
      { keyword: "weight", metric: "weight" },
      { keyword: "mood", metric: "mood" },
      { keyword: "energy", metric: "energy" },
      { keyword: "water", metric: "hydration" },
      { keyword: "food", metric: "nutrition" },
      { keyword: "exercise", metric: "exercise" },
    ];

    metricKeywords.forEach(({ keyword, metric }) => {
      if (inputLower.includes(keyword)) {
        metrics.push(metric as HealthMetric["type"]);
      }
    });

    return { type, urgency, metrics };
  }

  private async generateHealthResponse(
    input: string,
    healthNeeds: any,
    context: UserContext
  ): Promise<AgentResponse> {
    let content = "";
    let suggestedActions: string[] = [];

    switch (healthNeeds.type) {
      case "tracking":
        content = await this.generateTrackingResponse(healthNeeds);
        suggestedActions = ["Log health data", "View metrics", "Set up tracking"];
        break;

      case "goals":
        content = await this.generateGoalsResponse(healthNeeds);
        suggestedActions = ["View goals", "Set new goal", "Update progress"];
        break;

      case "alerts":
        content = await this.generateAlertsResponse(healthNeeds);
        suggestedActions = ["View alerts", "Dismiss alert", "Set up alerts"];
        break;

      case "recommendations":
        content = await this.generateRecommendationsResponse(healthNeeds);
        suggestedActions = ["Get recommendations", "Apply suggestion", "Customize advice"];
        break;

      case "insights":
        content = await this.generateInsightsResponse(healthNeeds);
        suggestedActions = ["View insights", "Analyze trends", "Export data"];
        break;

      case "wellness":
        content = await this.generateWellnessResponse(healthNeeds);
        suggestedActions = ["Wellness check", "Health assessment", "Lifestyle review"];
        break;

      default:
        content = await this.generateGeneralHealthResponse(healthNeeds);
        suggestedActions = ["Health dashboard", "Track metrics", "Set goals"];
    }

    // Add health-specific emotional support
    if (healthNeeds.urgency === "high") {
      content += " I understand you're concerned about your health. Remember, I'm here to support you, but for medical emergencies, please contact a healthcare professional immediately.";
    }

    return {
      content,
      confidence: 0.85,
      suggestedActions,
      emotionalSupport: {
        primary: "supportive",
        intensity: 0.6,
        valence: 0.7,
        arousal: 0.4,
        confidence: 0.8,
        timestamp: new Date(),
      },
      metadata: {
        healthNeeds,
        metricsCount: this.healthMetrics.size,
        goalsCount: this.healthGoals.size,
        alertsCount: this.healthAlerts.size,
        recommendationsCount: this.recommendations.size,
        agentId: this.id,
      },
    };
  }

  private async generateTrackingResponse(healthNeeds: any): Promise<string> {
    const { metrics } = healthNeeds;

    let content = "I'm here to help you track your health metrics effectively! ";

    if (metrics.length > 0) {
      content += `I can help you track: ${metrics.join(", ")}. `;
    }

    const recentMetrics = this.getRecentMetrics("default-user", 3);
    if (recentMetrics.length > 0) {
      content += "Your recent health data: ";
      recentMetrics.forEach(metric => {
        content += `${metric.type}: ${metric.value} ${metric.unit}, `;
      });
      content = content.slice(0, -2) + ". ";
    }

    content += "I can help you log new data, view trends, or set up automatic tracking. ";
    content += "What would you like to track today?";

    return content;
  }

  private async generateGoalsResponse(healthNeeds: any): Promise<string> {
    let content = "Let's work together to achieve your health goals! ";

    const activeGoals = Array.from(this.healthGoals.values())
      .filter(goal => goal.isActive)
      .slice(0, 3);

    if (activeGoals.length > 0) {
      content += "Your current goals: ";
      activeGoals.forEach(goal => {
        const progressEmoji = goal.progress >= 80 ? "🎉" : goal.progress >= 60 ? "👍" : "📈";
        content += `${progressEmoji} ${goal.type}: ${goal.current}/${goal.target} ${goal.unit} (${goal.progress}%), `;
      });
      content = content.slice(0, -2) + ". ";
    }

    content += "I can help you set new goals, track progress, or adjust existing targets. ";
    content += "What health goal would you like to work on?";

    return content;
  }

  private async generateAlertsResponse(healthNeeds: any): Promise<string> {
    const { urgency } = healthNeeds;

    let content = "Stay informed about your health with smart alerts! ";

    const unreadAlerts = Array.from(this.healthAlerts.values())
      .filter(alert => !alert.isRead)
      .slice(0, 3);

    if (unreadAlerts.length > 0) {
      content += `You have ${unreadAlerts.length} unread alerts: `;
      unreadAlerts.forEach(alert => {
        const severityEmoji = alert.severity === "high" ? "🚨" : alert.severity === "medium" ? "⚠️" : "💡";
        content += `${severityEmoji} ${alert.title}, `;
      });
      content = content.slice(0, -2) + ". ";
    }

    if (urgency === "high") {
      content += "I can set up immediate alerts for critical health metrics. ";
    }

    content += "I can help you manage alerts, set up notifications, or review your health status. ";
    content += "What alerts would you like to see?";

    return content;
  }

  private async generateRecommendationsResponse(healthNeeds: any): Promise<string> {
    let content = "Get personalized health recommendations to improve your wellness! ";

    const highPriorityRecs = Array.from(this.recommendations.values())
      .filter(rec => rec.priority === "high")
      .slice(0, 2);

    if (highPriorityRecs.length > 0) {
      content += "Top recommendations for you: ";
      highPriorityRecs.forEach(rec => {
        content += `"${rec.title}" (${rec.timeRequired} min, ${rec.estimatedImpact}% impact), `;
      });
      content = content.slice(0, -2) + ". ";
    }

    content += "I can provide recommendations for exercise, nutrition, sleep, stress management, and prevention. ";
    content += "What area of health would you like recommendations for?";

    return content;
  }

  private async generateInsightsResponse(healthNeeds: any): Promise<string> {
    let content = "Discover insights about your health patterns and trends! ";

    content += "I can analyze your health data to provide insights about: ";
    content += "• Sleep patterns and quality ";
    content += "• Exercise consistency and progress ";
    content += "• Nutrition habits and trends ";
    content += "• Stress levels and management ";
    content += "• Overall wellness trends ";

    content += "Let's look at your health data and find patterns that can help you improve. ";
    content += "What type of insights would you like to explore?";

    return content;
  }

  private async generateWellnessResponse(healthNeeds: any): Promise<string> {
    let content = "Your wellness journey is unique, and I'm here to support it! ";

    content += "I can help you with: ";
    content += "• Comprehensive health assessments ";
    content += "• Personalized wellness plans ";
    content += "• Lifestyle optimization ";
    content += "• Preventive health measures ";
    content += "• Mental and physical wellness ";
    content += "• Holistic health approaches ";

    content += "Wellness is about balance and sustainable healthy habits. ";
    content += "What aspect of your wellness would you like to focus on today?";

    return content;
  }

  private async generateGeneralHealthResponse(healthNeeds: any): Promise<string> {
    let content = "I'm your personal health monitoring assistant! ";

    content += "I can help you with: ";
    content += "• Tracking health metrics and trends ";
    content += "• Setting and achieving health goals ";
    content += "• Receiving health alerts and reminders ";
    content += "• Getting personalized recommendations ";
    content += "• Analyzing health insights ";
    content += "• Supporting your wellness journey ";

    content += "Let's work together to improve your health and wellness. ";
    content += "What would you like to focus on today?";

    return content;
  }

  private getRecentMetrics(userId: string, limit: number): HealthMetric[] {
    const userMetrics = this.healthMetrics.get(userId) || [];
    return userMetrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getHealthMetrics(userId: string, type?: HealthMetric["type"], days?: number): Promise<HealthMetric[]> {
    const userMetrics = this.healthMetrics.get(userId) || [];
    let filtered = userMetrics;

    if (type) {
      filtered = filtered.filter(metric => metric.type === type);
    }

    if (days) {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(metric => metric.timestamp >= cutoffDate);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getHealthGoals(userId: string): Promise<HealthGoal[]> {
    return Array.from(this.healthGoals.values());
  }

  async getHealthAlerts(userId: string, unreadOnly?: boolean): Promise<HealthAlert[]> {
    const alerts = Array.from(this.healthAlerts.values());
    return unreadOnly ? alerts.filter(alert => !alert.isRead) : alerts;
  }

  async getRecommendations(category?: WellnessRecommendation["category"]): Promise<WellnessRecommendation[]> {
    const recs = Array.from(this.recommendations.values());
    return category ? recs.filter(rec => rec.category === category) : recs;
  }

  async logHealthMetric(userId: string, metricData: Omit<HealthMetric, "id">): Promise<HealthMetric> {
    const id = `metric-${Date.now()}`;
    const metric: HealthMetric = { ...metricData, id };

    const userMetrics = this.healthMetrics.get(userId) || [];
    userMetrics.push(metric);
    this.healthMetrics.set(userId, userMetrics);

    // Check for alerts based on new metric
    this.checkForAlerts(userId, metric);

    return metric;
  }

  async updateHealthGoal(goalId: string, current: number): Promise<boolean> {
    const goal = this.healthGoals.get(goalId);
    if (goal) {
      goal.current = current;
      goal.progress = Math.min(100, (current / goal.target) * 100);
      return true;
    }
    return false;
  }

  async markAlertAsRead(alertId: string): Promise<boolean> {
    const alert = this.healthAlerts.get(alertId);
    if (alert) {
      alert.isRead = true;
      return true;
    }
    return false;
  }

  private checkForAlerts(userId: string, metric: HealthMetric): void {
    // Example alert logic
    if (metric.type === "heart_rate" && metric.value > 100) {
      this.createHealthAlert({
        type: "warning",
        title: "Elevated Heart Rate",
        message: `Your heart rate is ${metric.value} bpm, which is above normal resting levels.`,
        metricType: "heart_rate",
        severity: "medium",
        timestamp: new Date(),
        isRead: false,
      });
    }
  }

  private createHealthAlert(alertData: Omit<HealthAlert, "id">): void {
    const id = `alert-${Date.now()}`;
    const alert: HealthAlert = { ...alertData, id };
    this.healthAlerts.set(id, alert);
  }
}
