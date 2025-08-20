import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ollamaClient } from "@/lib/ai/ollama-client";

const prisma = new PrismaClient();

// Performance thresholds
const SLOW_OPERATION_THRESHOLD = 1000; // 1 second
const CRITICAL_OPERATION_THRESHOLD = 5000; // 5 seconds

interface PerformanceData {
  operation: string;
  durationMs: number;
  isSlow: boolean;
  details: any;
  timestamp: Date;
}

class PerformanceProfiler {
  private static instance: PerformanceProfiler;
  private slowOperations: PerformanceData[] = [];
  private isAnalyzing = false;

  private constructor() {
    // Start periodic analysis
    setInterval(() => this.analyzeSlowOperations(), 5 * 60 * 1000); // Every 5 minutes
  }

  public static getInstance(): PerformanceProfiler {
    if (!PerformanceProfiler.instance) {
      PerformanceProfiler.instance = new PerformanceProfiler();
    }
    return PerformanceProfiler.instance;
  }

  public async profileOperation(
    operation: string,
    operationFn: () => Promise<any>,
    details?: any
  ): Promise<any> {
    const startTime = Date.now();

    try {
      const result = await operationFn();
      const durationMs = Date.now() - startTime;

      const performanceData: PerformanceData = {
        operation,
        durationMs,
        isSlow: durationMs > SLOW_OPERATION_THRESHOLD,
        details: {
          ...details,
          success: true,
          timestamp: new Date(),
        },
        timestamp: new Date(),
      };

      // Log to database
      await this.logPerformance(performanceData);

      // Track slow operations for analysis
      if (performanceData.isSlow) {
        this.slowOperations.push(performanceData);
        console.log(`🐌 Slow operation detected: ${operation} (${durationMs}ms)`);
      }

      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;

      const performanceData: PerformanceData = {
        operation,
        durationMs,
        isSlow: durationMs > SLOW_OPERATION_THRESHOLD,
        details: {
          ...details,
          success: false,
          error: error.message,
          timestamp: new Date(),
        },
        timestamp: new Date(),
      };

      await this.logPerformance(performanceData);
      throw error;
    }
  }

  private async logPerformance(data: PerformanceData) {
    try {
      await prisma.performanceTrace.create({
        data: {
          operation: data.operation,
          durationMs: data.durationMs,
          isSlow: data.isSlow,
          details: JSON.stringify(data.details),
        },
      });
    } catch (error) {
      console.error("Failed to log performance data:", error);
    }
  }

  private async analyzeSlowOperations() {
    if (this.isAnalyzing || this.slowOperations.length === 0) {
      return;
    }

    this.isAnalyzing = true;
    console.log("🔍 Genesis Engine: Analyzing slow operations...");

    try {
      // Get recent slow operations from database
      const recentSlowOps = await prisma.performanceTrace.findMany({
        where: {
          isSlow: true,
          createdAt: {
            gte: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      });

      if (recentSlowOps.length === 0) {
        this.isAnalyzing = false;
        return;
      }

      // Group operations by type
      const operationGroups = recentSlowOps.reduce((groups, op) => {
        const baseOperation = op.operation.split(":")[0]; // e.g., "GET" from "GET:/api/finance/summary"
        if (!groups[baseOperation]) {
          groups[baseOperation] = [];
        }
        groups[baseOperation].push(op);
        return groups;
      }, {} as Record<string, any[]>);

      // Analyze each group
      for (const [operationType, operations] of Object.entries(operationGroups)) {
        await this.analyzeOperationGroup(operationType, operations);
      }

      // Clear the local cache
      this.slowOperations = [];

    } catch (error) {
      console.error("❌ Performance analysis failed:", error);
    } finally {
      this.isAnalyzing = false;
    }
  }

  private async analyzeOperationGroup(operationType: string, operations: any[]) {
    const avgDuration = operations.reduce((sum, op) => sum + op.durationMs, 0) / operations.length;
    const maxDuration = Math.max(...operations.map(op => op.durationMs));
    const count = operations.length;

    const prompt = `Performance Analysis Required

The following slow operations have been detected:

Operation Type: ${operationType}
Average Duration: ${avgDuration.toFixed(2)}ms
Maximum Duration: ${maxDuration}ms
Occurrence Count: ${count} times

Recent slow operations:
${operations.slice(0, 5).map(op =>
  `- ${op.operation}: ${op.durationMs}ms at ${op.createdAt}`
).join("\n")}

Please analyze this performance issue and provide:
1. Potential root causes (e.g., inefficient queries, missing indexes, memory leaks)
2. Specific optimization strategies
3. Code-level recommendations
4. Infrastructure improvements if needed

Respond with actionable recommendations that can be implemented by the system.`;

    try {
      const response = await ollamaClient.chat({
        messages: [{ role: "user", content: prompt }],
        model: "llama3.2:3b",
      });

      // Log the AI analysis
      await prisma.performanceTrace.create({
        data: {
          operation: `AI_ANALYSIS:${operationType}`,
          durationMs: 0,
          isSlow: false,
          details: JSON.stringify({
            analysis: response.message.content,
            operationType,
            avgDuration,
            maxDuration,
            count,
            timestamp: new Date(),
          }),
        },
      });

      console.log(`✅ Genesis Engine: Performance analysis completed for ${operationType}`);
      console.log("AI Analysis:", response.message.content);

    } catch (error) {
      console.error(`❌ AI analysis failed for ${operationType}:`, error);
    }
  }

  public async getPerformanceStats() {
    try {
      const stats = await prisma.performanceTrace.groupBy({
        by: ["operation"],
        _avg: {
          durationMs: true,
        },
        _count: {
          operation: true,
        },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      return stats.map(stat => ({
        operation: stat.operation,
        averageDuration: stat._avg.durationMs,
        count: stat._count.operation,
      }));
    } catch (error) {
      console.error("Failed to get performance stats:", error);
      return [];
    }
  }
}

// Middleware function for API routes
export function withPerformanceProfiling(handler: Function) {
  return async(request: NextRequest, ...args: any[]) => {
    const profiler = PerformanceProfiler.getInstance();
    const operation = `${request.method}:${request.nextUrl.pathname}`;

    return profiler.profileOperation(
      operation,
      () => handler(request, ...args),
      {
        method: request.method,
        path: request.nextUrl.pathname,
        userAgent: request.headers.get("user-agent"),
        timestamp: new Date(),
      }
    );
  };
}

// Export the profiler instance
export const performanceProfiler = PerformanceProfiler.getInstance();
