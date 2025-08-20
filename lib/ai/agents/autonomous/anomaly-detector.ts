import { Agent, AgentResponse } from "../../core/agent";
import { UserContext, EmotionalState } from "../../core/master-conductor";

export interface SystemMetric {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  errorRate: number;
  userSatisfaction: number;
  activeConnections: number;
  queueLength: number;
}

export interface Anomaly {
  id: string;
  type: "performance" | "security" | "error" | "behavioral" | "predictive";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  detectedAt: Date;
  metrics: SystemMetric;
  confidence: number;
  predictedImpact: string;
  recommendedAction: string;
  status: "detected" | "investigating" | "resolved" | "false_positive";
}

export interface PredictionModel {
  id: string;
  type: "regression" | "classification" | "time_series";
  accuracy: number;
  lastUpdated: Date;
  features: string[];
  threshold: number;
}

export class AnomalyDetector extends Agent {
  private metricsHistory: SystemMetric[] = [];
  private anomalies: Map<string, Anomaly> = new Map();
  private predictionModels: Map<string, PredictionModel> = new Map();
  private baselineMetrics: SystemMetric | null = null;
  private alertThresholds: Map<string, number> = new Map();
  private isMonitoring = false;

  constructor() {
    super(
      "anomaly-detector",
      "System Anomaly Detection Agent",
      "Monitors system health, detects anomalies, and predicts potential failures",
      [
        "real-time monitoring",
        "anomaly detection",
        "failure prediction",
        "performance analysis",
        "security monitoring",
        "predictive maintenance",
      ]
    );

    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    this.setupAlertThresholds();
    this.initializePredictionModels();
    this.startMonitoring();
  }

  private setupAlertThresholds(): void {
    this.alertThresholds.set("cpuUsage", 0.8); // 80% CPU usage
    this.alertThresholds.set("memoryUsage", 0.85); // 85% memory usage
    this.alertThresholds.set("responseTime", 2000); // 2 seconds
    this.alertThresholds.set("errorRate", 0.05); // 5% error rate
    this.alertThresholds.set("userSatisfaction", 0.6); // 60% satisfaction
    this.alertThresholds.set("activeConnections", 1000); // 1000 concurrent connections
    this.alertThresholds.set("queueLength", 100); // 100 items in queue
  }

  private initializePredictionModels(): void {
    // Performance prediction model
    this.predictionModels.set("performance", {
      id: "performance-predictor",
      type: "time_series",
      accuracy: 0.85,
      lastUpdated: new Date(),
      features: ["cpuUsage", "memoryUsage", "responseTime", "activeConnections"],
      threshold: 0.7,
    });

    // Error prediction model
    this.predictionModels.set("errors", {
      id: "error-predictor",
      type: "classification",
      accuracy: 0.78,
      lastUpdated: new Date(),
      features: ["errorRate", "responseTime", "queueLength", "userSatisfaction"],
      threshold: 0.6,
    });

    // Security anomaly model
    this.predictionModels.set("security", {
      id: "security-predictor",
      type: "classification",
      accuracy: 0.92,
      lastUpdated: new Date(),
      features: ["activeConnections", "responseTime", "errorRate", "userSatisfaction"],
      threshold: 0.8,
    });
  }

  private startMonitoring(): void {
    this.isMonitoring = true;

    // Start real-time monitoring
    setInterval(() => {
      this.collectMetrics();
    }, 5000); // Collect metrics every 5 seconds

    // Start anomaly detection
    setInterval(() => {
      this.detectAnomalies();
    }, 10000); // Run detection every 10 seconds

    // Start predictive analysis
    setInterval(() => {
      this.runPredictiveAnalysis();
    }, 30000); // Run predictions every 30 seconds

    console.log("Anomaly detection monitoring started");
  }

  async process(
    input: string,
    context: UserContext,
    emotionalState: EmotionalState
  ): Promise<AgentResponse> {
    this.updateActivity();
    const startTime = Date.now();

    try {
      // Analyze system status based on input
      const systemStatus = await this.analyzeSystemStatus();
      const response = await this.generateAnomalyResponse(input, systemStatus);

      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(processingTime, response.confidence);

      return response;
    } catch (error) {
      console.error("AnomalyDetector processing error:", error);
      this.status.errorCount++;

      return {
        content: "I'm monitoring system health and detecting potential issues. I'm experiencing some technical difficulties right now, but the monitoring systems are still active.",
        confidence: 0.5,
        suggestedActions: ["Check system logs", "Review recent metrics", "Run diagnostic tests"],
        emotionalSupport: emotionalState,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          agentId: this.id,
        },
      };
    }
  }

  private async collectMetrics(): Promise<void> {
    // Simulate collecting system metrics
    const metric: SystemMetric = {
      timestamp: new Date(),
      cpuUsage: Math.random() * 0.9 + 0.1, // 10-100%
      memoryUsage: Math.random() * 0.8 + 0.2, // 20-100%
      responseTime: Math.random() * 3000 + 100, // 100-3100ms
      errorRate: Math.random() * 0.1, // 0-10%
      userSatisfaction: Math.random() * 0.4 + 0.6, // 60-100%
      activeConnections: Math.floor(Math.random() * 1500) + 50, // 50-1550
      queueLength: Math.floor(Math.random() * 200) + 10, // 10-210
    };

    this.metricsHistory.push(metric);

    // Keep only last 1000 metrics
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory = this.metricsHistory.slice(-1000);
    }

    // Update baseline if not set
    if (!this.baselineMetrics) {
      this.baselineMetrics = { ...metric };
    }
  }

  private async detectAnomalies(): Promise<void> {
    if (this.metricsHistory.length < 10) {
      return;
    }

    const currentMetric = this.metricsHistory[this.metricsHistory.length - 1];
    const recentMetrics = this.metricsHistory.slice(-10);

    // Check for performance anomalies
    await this.checkPerformanceAnomalies(currentMetric, recentMetrics);

    // Check for error rate anomalies
    await this.checkErrorAnomalies(currentMetric, recentMetrics);

    // Check for behavioral anomalies
    await this.checkBehavioralAnomalies(currentMetric, recentMetrics);

    // Check for security anomalies
    await this.checkSecurityAnomalies(currentMetric, recentMetrics);
  }

  private async checkPerformanceAnomalies(currentMetric: SystemMetric, recentMetrics: SystemMetric[]): Promise<void> {
    const avgCpuUsage = recentMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / recentMetrics.length;
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;

    // Check CPU usage anomaly
    if (currentMetric.cpuUsage > this.alertThresholds.get("cpuUsage")! ||
        currentMetric.cpuUsage > avgCpuUsage * 1.5) {
      await this.createAnomaly("performance", "high",
        `High CPU usage detected: ${(currentMetric.cpuUsage * 100).toFixed(1)}% (baseline: ${(avgCpuUsage * 100).toFixed(1)}%)`,
        currentMetric, 0.85, "System performance degradation", "Scale resources or optimize processes");
    }

    // Check response time anomaly
    if (currentMetric.responseTime > this.alertThresholds.get("responseTime")! ||
        currentMetric.responseTime > avgResponseTime * 2) {
      await this.createAnomaly("performance", "medium",
        `High response time detected: ${currentMetric.responseTime.toFixed(0)}ms (baseline: ${avgResponseTime.toFixed(0)}ms)`,
        currentMetric, 0.8, "User experience degradation", "Optimize database queries or add caching");
    }
  }

  private async checkErrorAnomalies(currentMetric: SystemMetric, recentMetrics: SystemMetric[]): Promise<void> {
    const avgErrorRate = recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length;

    if (currentMetric.errorRate > this.alertThresholds.get("errorRate")! ||
        currentMetric.errorRate > avgErrorRate * 3) {
      await this.createAnomaly("error", "high",
        `High error rate detected: ${(currentMetric.errorRate * 100).toFixed(2)}% (baseline: ${(avgErrorRate * 100).toFixed(2)}%)`,
        currentMetric, 0.9, "System reliability issues", "Investigate error logs and fix root cause");
    }
  }

  private async checkBehavioralAnomalies(currentMetric: SystemMetric, recentMetrics: SystemMetric[]): Promise<void> {
    const avgUserSatisfaction = recentMetrics.reduce((sum, m) => sum + m.userSatisfaction, 0) / recentMetrics.length;

    if (currentMetric.userSatisfaction < this.alertThresholds.get("userSatisfaction")! ||
        currentMetric.userSatisfaction < avgUserSatisfaction * 0.8) {
      await this.createAnomaly("behavioral", "medium",
        `Low user satisfaction detected: ${(currentMetric.userSatisfaction * 100).toFixed(1)}% (baseline: ${(avgUserSatisfaction * 100).toFixed(1)}%)`,
        currentMetric, 0.75, "User experience issues", "Review recent changes and user feedback");
    }
  }

  private async checkSecurityAnomalies(currentMetric: SystemMetric, recentMetrics: SystemMetric[]): Promise<void> {
    const avgConnections = recentMetrics.reduce((sum, m) => sum + m.activeConnections, 0) / recentMetrics.length;

    if (currentMetric.activeConnections > this.alertThresholds.get("activeConnections")! ||
        currentMetric.activeConnections > avgConnections * 2) {
      await this.createAnomaly("security", "high",
        `Unusual connection spike detected: ${currentMetric.activeConnections} (baseline: ${avgConnections.toFixed(0)})`,
        currentMetric, 0.88, "Potential DDoS or security breach", "Investigate connection sources and implement rate limiting");
    }
  }

  private async createAnomaly(
    type: Anomaly["type"],
    severity: Anomaly["severity"],
    description: string,
    metrics: SystemMetric,
    confidence: number,
    predictedImpact: string,
    recommendedAction: string
  ): Promise<void> {
    const anomaly: Anomaly = {
      id: `anomaly-${Date.now()}`,
      type,
      severity,
      description,
      detectedAt: new Date(),
      metrics,
      confidence,
      predictedImpact,
      recommendedAction,
      status: "detected",
    };

    this.anomalies.set(anomaly.id, anomaly);

    console.log(`Anomaly detected: ${description} (${severity} severity)`);

    // Trigger immediate response for critical anomalies
    if (severity === "critical") {
      await this.triggerCriticalResponse(anomaly);
    }
  }

  private async triggerCriticalResponse(anomaly: Anomaly): Promise<void> {
    console.log(`CRITICAL ANOMALY: ${anomaly.description}`);
    console.log(`Recommended action: ${anomaly.recommendedAction}`);

    // In a real implementation, this would trigger:
    // - Alert notifications
    // - Automatic scaling
    // - Failover procedures
    // - Emergency response protocols
  }

  private async runPredictiveAnalysis(): Promise<void> {
    if (this.metricsHistory.length < 50) {
      return;
    }

    // Predict potential failures
    const failurePrediction = await this.predictFailures();

    if (failurePrediction.probability > 0.7) {
      await this.createAnomaly("predictive", "medium",
        `Potential failure predicted: ${failurePrediction.description}`,
        this.metricsHistory[this.metricsHistory.length - 1],
        failurePrediction.probability,
        "System failure within 24 hours",
        "Implement preventive maintenance and monitoring"
      );
    }

    // Update prediction models
    await this.updatePredictionModels();
  }

  private async predictFailures(): Promise<{
    probability: number;
    description: string;
    timeframe: string;
  }> {
    const recentMetrics = this.metricsHistory.slice(-20);

    // Analyze trends
    const cpuTrend = this.calculateTrend(recentMetrics.map(m => m.cpuUsage));
    const memoryTrend = this.calculateTrend(recentMetrics.map(m => m.memoryUsage));
    const errorTrend = this.calculateTrend(recentMetrics.map(m => m.errorRate));

    let probability = 0;
    let description = "";

    // High CPU trend with increasing errors
    if (cpuTrend > 0.1 && errorTrend > 0.05) {
      probability = 0.8;
      description = "Increasing CPU usage with rising error rates";
    } else if (memoryTrend > 0.15) {
      probability = 0.7;
      description = "Memory usage trending toward exhaustion";
    } else if (errorTrend > 0.1) {
      probability = 0.6;
      description = "Rapidly increasing error rates";
    }

    return {
      probability,
      description,
      timeframe: "24 hours",
    };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) {
      return 0;
    }

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + val * index, 0);
    const sumX2 = values.reduce((sum, val, index) => sum + index * index, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private async updatePredictionModels(): Promise<void> {
    // Update model accuracy based on recent predictions
    this.predictionModels.forEach((model, key) => {
      // Simulate accuracy improvement
      model.accuracy = Math.min(0.95, model.accuracy + Math.random() * 0.02);
      model.lastUpdated = new Date();
    });
  }

  private async analyzeSystemStatus(): Promise<{
    health: "excellent" | "good" | "fair" | "poor" | "critical";
    metrics: SystemMetric;
    activeAnomalies: number;
    recommendations: string[];
  }> {
    const currentMetric = this.metricsHistory[this.metricsHistory.length - 1] || this.getDefaultMetric();
    const activeAnomalies = Array.from(this.anomalies.values()).filter(a => a.status === "detected").length;

    let health: "excellent" | "good" | "fair" | "poor" | "critical" = "excellent";
    const recommendations: string[] = [];

    // Assess system health
    if (currentMetric.cpuUsage > 0.9 || currentMetric.errorRate > 0.1) {
      health = "critical";
      recommendations.push("Immediate intervention required");
    } else if (currentMetric.cpuUsage > 0.8 || currentMetric.errorRate > 0.05) {
      health = "poor";
      recommendations.push("System optimization needed");
    } else if (currentMetric.cpuUsage > 0.6 || currentMetric.errorRate > 0.02) {
      health = "fair";
      recommendations.push("Monitor system performance");
    } else if (currentMetric.cpuUsage > 0.4) {
      health = "good";
    }

    if (activeAnomalies > 0) {
      recommendations.push(`Address ${activeAnomalies} active anomalies`);
    }

    return {
      health,
      metrics: currentMetric,
      activeAnomalies,
      recommendations,
    };
  }

  private getDefaultMetric(): SystemMetric {
    return {
      timestamp: new Date(),
      cpuUsage: 0.3,
      memoryUsage: 0.5,
      responseTime: 500,
      errorRate: 0.01,
      userSatisfaction: 0.85,
      activeConnections: 100,
      queueLength: 20,
    };
  }

  private async generateAnomalyResponse(
    input: string,
    systemStatus: any
  ): Promise<AgentResponse> {
    let content = "";
    let suggestedActions: string[] = [];

    if (input.toLowerCase().includes("status") || input.toLowerCase().includes("health")) {
      content = `System health status: ${systemStatus.health.toUpperCase()}. `;
      content += `Current metrics: CPU ${(systemStatus.metrics.cpuUsage * 100).toFixed(1)}%, Memory ${(systemStatus.metrics.memoryUsage * 100).toFixed(1)}%, Response time ${systemStatus.metrics.responseTime.toFixed(0)}ms. `;

      if (systemStatus.activeAnomalies > 0) {
        content += `There are ${systemStatus.activeAnomalies} active anomalies being monitored. `;
      }

      content += `Recommendations: ${systemStatus.recommendations.join(", ")}.`;

      suggestedActions = systemStatus.recommendations;
    } else if (input.toLowerCase().includes("anomaly") || input.toLowerCase().includes("issue")) {
      const recentAnomalies = Array.from(this.anomalies.values())
        .filter(a => a.status === "detected")
        .slice(-3);

      if (recentAnomalies.length > 0) {
        content = "Recent anomalies detected: ";
        recentAnomalies.forEach(anomaly => {
          content += `${anomaly.description} (${anomaly.severity} severity). `;
        });
        content += `Recommended actions: ${recentAnomalies[0].recommendedAction}.`;

        suggestedActions = recentAnomalies.map(a => a.recommendedAction);
      } else {
        content = "No active anomalies detected. System is operating normally.";
        suggestedActions = ["Continue monitoring", "Review system logs", "Update monitoring thresholds"];
      }
    } else {
      content = "I'm actively monitoring system health and detecting anomalies. ";
      content += `Current system health: ${systemStatus.health}. `;
      content += "I can provide detailed status reports, anomaly information, or predictive analysis. What would you like to know?";

      suggestedActions = ["Get system status", "View recent anomalies", "Run predictive analysis"];
    }

    return {
      content,
      confidence: 0.9,
      suggestedActions,
      emotionalSupport: {
        primary: "analytical",
        intensity: 0.6,
        valence: 0.7,
        arousal: 0.4,
        confidence: 0.9,
        timestamp: new Date(),
      },
      metadata: {
        systemStatus,
        activeAnomalies: systemStatus.activeAnomalies,
        monitoringActive: this.isMonitoring,
        agentId: this.id,
      },
    };
  }

  async getAnomalies(status?: Anomaly["status"]): Promise<Anomaly[]> {
    const anomalies = Array.from(this.anomalies.values());
    return status ? anomalies.filter(a => a.status === status) : anomalies;
  }

  async getMetricsHistory(limit: number = 100): Promise<SystemMetric[]> {
    return this.metricsHistory.slice(-limit);
  }

  async getPredictionModels(): Promise<PredictionModel[]> {
    return Array.from(this.predictionModels.values());
  }

  async updateAnomalyStatus(anomalyId: string, status: Anomaly["status"]): Promise<void> {
    const anomaly = this.anomalies.get(anomalyId);
    if (anomaly) {
      anomaly.status = status;
    }
  }

  async setAlertThreshold(metric: string, threshold: number): Promise<void> {
    this.alertThresholds.set(metric, threshold);
  }
}
