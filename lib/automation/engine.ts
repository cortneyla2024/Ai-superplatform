import { PrismaClient } from "@prisma/client";
import { eventBus, AutomationEvent, AutomationEventType } from "./event-bus";
import { actionExecutor } from "./action-executor";

const prisma = new PrismaClient();

export class AutomationEngine {
  private static instance: AutomationEngine;

  private constructor() {
    this.initializeEventListeners();
  }

  public static getInstance(): AutomationEngine {
    if (!AutomationEngine.instance) {
      AutomationEngine.instance = new AutomationEngine();
    }
    return AutomationEngine.instance;
  }

  private initializeEventListeners(): void {
    // Listen to all automation events
    eventBus.on("automation", async(event: AutomationEvent) => {
      await this.processEvent(event);
    });
  }

  private async processEvent(event: AutomationEvent): Promise<void> {
    try {
      // Find all enabled routines for this user
      const routines = await prisma.automationRoutine.findMany({
        where: {
          userId: event.userId,
          isEnabled: true,
        },
        include: {
          triggers: true,
          actions: true,
        },
      });

      // Check each routine for matching triggers
      for (const routine of routines) {
        const shouldExecute = await this.evaluateTriggers(routine.triggers, event);

        if (shouldExecute) {
          await this.executeRoutine(routine, event);
        }
      }
    } catch (error) {
      console.error("Error processing automation event:", error);
    }
  }

  private async evaluateTriggers(triggers: any[], event: AutomationEvent): Promise<boolean> {
    // All triggers must match for the routine to execute (AND logic)
    for (const trigger of triggers) {
      const matches = await this.evaluateTrigger(trigger, event);
      if (!matches) {
        return false;
      }
    }
    return true;
  }

  private async evaluateTrigger(trigger: any, event: AutomationEvent): Promise<boolean> {
    switch (trigger.type) {
      case "MOOD_BELOW_THRESHOLD":
        return this.evaluateMoodThreshold(trigger.params, event);

      case "HABIT_COMPLETED":
        return this.evaluateHabitCompleted(trigger.params, event);

      case "HABIT_MISSED":
        return this.evaluateHabitMissed(trigger.params, event);

      case "TRANSACTION_CREATED":
        return this.evaluateTransactionCreated(trigger.params, event);

      case "BUDGET_EXCEEDED":
        return this.evaluateBudgetExceeded(trigger.params, event);

      case "GOAL_COMPLETED":
        return this.evaluateGoalCompleted(trigger.params, event);

      case "JOURNAL_CREATED":
        return this.evaluateJournalCreated(trigger.params, event);

      case "ASSESSMENT_COMPLETED":
        return this.evaluateAssessmentCompleted(trigger.params, event);

      case "SCHEDULED_TIME":
        return this.evaluateScheduledTime(trigger.params, event);

      default:
        console.warn(`Unknown trigger type: ${trigger.type}`);
        return false;
    }
  }

  private async evaluateMoodThreshold(params: any, event: AutomationEvent): Promise<boolean> {
    if (event.type !== "mood.created" && event.type !== "mood.below_threshold") {
      return false;
    }

    const threshold = params.threshold || 5;
    const moodScore = event.data.moodScore || event.data.score;

    return moodScore <= threshold;
  }

  private async evaluateHabitCompleted(params: any, event: AutomationEvent): Promise<boolean> {
    if (event.type !== "habit.completed") {
      return false;
    }

    const habitName = params.habitName;
    if (!habitName) {
return true;
} // No specific habit specified, any habit completion triggers

    return event.data.habitName === habitName;
  }

  private async evaluateHabitMissed(params: any, event: AutomationEvent): Promise<boolean> {
    if (event.type !== "habit.missed") {
      return false;
    }

    const habitName = params.habitName;
    if (!habitName) {
return true;
}

    return event.data.habitName === habitName;
  }

  private async evaluateTransactionCreated(params: any, event: AutomationEvent): Promise<boolean> {
    if (event.type !== "transaction.created") {
      return false;
    }

    const category = params.category;
    const minAmount = params.minAmount;
    const maxAmount = params.maxAmount;

    if (category && event.data.category !== category) {
      return false;
    }

    if (minAmount && event.data.amount < minAmount) {
      return false;
    }

    if (maxAmount && event.data.amount > maxAmount) {
      return false;
    }

    return true;
  }

  private async evaluateBudgetExceeded(params: any, event: AutomationEvent): Promise<boolean> {
    if (event.type !== "budget.exceeded") {
      return false;
    }

    const budgetName = params.budgetName;
    if (!budgetName) {
return true;
}

    return event.data.budgetName === budgetName;
  }

  private async evaluateGoalCompleted(params: any, event: AutomationEvent): Promise<boolean> {
    if (event.type !== "goal.completed") {
      return false;
    }

    const goalCategory = params.category;
    if (!goalCategory) {
return true;
}

    return event.data.category === goalCategory;
  }

  private async evaluateJournalCreated(params: any, event: AutomationEvent): Promise<boolean> {
    if (event.type !== "journal.created") {
      return false;
    }

    // Could add more sophisticated logic here (e.g., check for specific tags)
    return true;
  }

  private async evaluateAssessmentCompleted(params: any, event: AutomationEvent): Promise<boolean> {
    if (event.type !== "assessment.completed") {
      return false;
    }

    const assessmentType = params.assessmentType;
    if (!assessmentType) {
return true;
}

    return event.data.type === assessmentType;
  }

  private async evaluateScheduledTime(params: any, event: AutomationEvent): Promise<boolean> {
    if (event.type !== "scheduled.time") {
      return false;
    }

    // This is handled by the cron job, so if we receive this event,
    // it means the scheduled time has been reached
    return true;
  }

  private async executeRoutine(routine: any, event: AutomationEvent): Promise<void> {
    console.log(`Executing automation routine: ${routine.name}`);

    for (const action of routine.actions) {
      try {
        const result = await actionExecutor.executeAction(action, event);

        // Log the successful execution
        await prisma.automationLog.create({
          data: {
            routineId: routine.id,
            status: "SUCCESS",
            message: `Action ${action.type} executed successfully: ${result}`,
          },
        });
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);

        // Log the failed execution
        await prisma.automationLog.create({
          data: {
            routineId: routine.id,
            status: "FAILED",
            message: `Action ${action.type} failed: ${error.message}`,
          },
        });
      }
    }
  }

  // Public method to manually trigger scheduled routines
  public async processScheduledRoutines(): Promise<void> {
    try {
      const routines = await prisma.automationRoutine.findMany({
        where: {
          isEnabled: true,
        },
        include: {
          triggers: true,
          actions: true,
        },
      });

      const now = new Date();

      for (const routine of routines) {
        for (const trigger of routine.triggers) {
          if (trigger.type === "SCHEDULED_TIME") {
            const shouldExecute = await this.evaluateScheduledTimeTrigger(trigger.params, now);
            if (shouldExecute) {
              const event: AutomationEvent = {
                type: "scheduled.time",
                userId: routine.userId,
                data: { scheduledTime: now },
                timestamp: now,
              };
              await this.executeRoutine(routine, event);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error processing scheduled routines:", error);
    }
  }

  private async evaluateScheduledTimeTrigger(params: any, now: Date): Promise<boolean> {
    // Simple cron-like evaluation
    // For now, we'll use a basic implementation
    // In production, you might want to use a proper cron parser

    const cronExpression = params.cron;
    if (!cronExpression) {
return false;
}

    // This is a simplified cron parser - in production, use a library like 'cron-parser'
    // For now, we'll just check if it's time to run based on basic patterns

    const parts = cronExpression.split(" ");
    if (parts.length !== 5) {
return false;
}

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    const currentMinute = now.getMinutes();
    const currentHour = now.getHours();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
    const currentDayOfWeek = now.getDay(); // 0 = Sunday

    // Simple wildcard matching
    const matchesMinute = minute === "*" || parseInt(minute) === currentMinute;
    const matchesHour = hour === "*" || parseInt(hour) === currentHour;
    const matchesDay = dayOfMonth === "*" || parseInt(dayOfMonth) === currentDay;
    const matchesMonth = month === "*" || parseInt(month) === currentMonth;
    const matchesDayOfWeek = dayOfWeek === "*" || parseInt(dayOfWeek) === currentDayOfWeek;

    return matchesMinute && matchesHour && matchesDay && matchesMonth && matchesDayOfWeek;
  }
}

export const automationEngine = AutomationEngine.getInstance();
