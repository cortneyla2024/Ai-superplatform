import { PrismaClient } from "@prisma/client";
import { AutomationEvent } from "./event-bus";
import { generateAIResponse } from "../ai";

const prisma = new PrismaClient();

export class ActionExecutor {
  private static instance: ActionExecutor;

  private constructor() {}

  public static getInstance(): ActionExecutor {
    if (!ActionExecutor.instance) {
      ActionExecutor.instance = new ActionExecutor();
    }
    return ActionExecutor.instance;
  }

  public async executeAction(action: any, event: AutomationEvent): Promise<string> {
    switch (action.type) {
      case "CREATE_JOURNAL_PROMPT":
        return this.createJournalPrompt(action.params, event);

      case "SUGGEST_COPING_STRATEGY":
        return this.suggestCopingStrategy(action.params, event);

      case "CREATE_TRANSACTION":
        return this.createTransaction(action.params, event);

      case "CREATE_GOAL":
        return this.createGoal(action.params, event);

      case "SEND_NOTIFICATION":
        return this.sendNotification(action.params, event);

      case "GENERATE_AI_INSIGHT":
        return this.generateAIInsight(action.params, event);

      case "CREATE_HABIT_REMINDER":
        return this.createHabitReminder(action.params, event);

      case "ANALYZE_SPENDING_PATTERN":
        return this.analyzeSpendingPattern(action.params, event);

      case "SUGGEST_ACTIVITY":
        return this.suggestActivity(action.params, event);

      case "CREATE_MOOD_CHECK_IN":
        return this.createMoodCheckIn(action.params, event);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  private async createJournalPrompt(params: any, event: AutomationEvent): Promise<string> {
    const prompt = params.prompt || "Reflect on your day and how you're feeling.";

    // Create a journal entry with the AI-generated prompt
    const journalEntry = await prisma.journalEntry.create({
      data: {
        userId: event.userId,
        title: "Automated Journal Prompt",
        content: prompt,
        tags: ["automated", "prompt"],
        isPrivate: true,
      },
    });

    return `Created journal prompt: ${journalEntry.id}`;
  }

  private async suggestCopingStrategy(params: any, event: AutomationEvent): Promise<string> {
    const category = params.category || "General";

    // Find a coping strategy in the specified category
    const strategy = await prisma.copingStrategy.findFirst({
      where: {
        category: category,
      },
    });

    if (!strategy) {
      return "No coping strategy found for the specified category";
    }

    // Create a proactive insight with the coping strategy
    await prisma.proactiveInsight.create({
      data: {
        userId: event.userId,
        content: `Here's a coping strategy that might help: ${strategy.title} - ${strategy.description}`,
        category: "WELLNESS",
        priority: "MEDIUM",
      },
    });

    return `Suggested coping strategy: ${strategy.title}`;
  }

  private async createTransaction(params: any, event: AutomationEvent): Promise<string> {
    const { description, amount, category, type } = params;

    if (!description || !amount || !category || !type) {
      throw new Error("Missing required transaction parameters");
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: event.userId,
        description,
        amount: parseFloat(amount),
        category,
        type,
        date: new Date(),
      },
    });

    return `Created transaction: ${transaction.id}`;
  }

  private async createGoal(params: any, event: AutomationEvent): Promise<string> {
    const { title, description, category, targetDate } = params;

    if (!title || !category) {
      throw new Error("Missing required goal parameters");
    }

    const goal = await prisma.goal.create({
      data: {
        userId: event.userId,
        title,
        description: description || "",
        category,
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    });

    return `Created goal: ${goal.id}`;
  }

  private async sendNotification(params: any, event: AutomationEvent): Promise<string> {
    const { message, priority } = params;

    if (!message) {
      throw new Error("Missing notification message");
    }

    // Create a proactive insight as a notification
    await prisma.proactiveInsight.create({
      data: {
        userId: event.userId,
        content: message,
        category: "WELLNESS",
        priority: priority || "MEDIUM",
      },
    });

    return `Sent notification: ${message}`;
  }

  private async generateAIInsight(params: any, event: AutomationEvent): Promise<string> {
    const { context, prompt } = params;

    if (!prompt) {
      throw new Error("Missing AI insight prompt");
    }

    try {
      const aiResponse = await generateAIResponse(prompt, context);

      // Create a proactive insight with the AI-generated content
      await prisma.proactiveInsight.create({
        data: {
          userId: event.userId,
          content: aiResponse,
          category: "WELLNESS",
          priority: "LOW",
        },
      });

      return `Generated AI insight: ${aiResponse.substring(0, 100)}...`;
    } catch (error) {
      throw new Error(`Failed to generate AI insight: ${error.message}`);
    }
  }

  private async createHabitReminder(params: any, event: AutomationEvent): Promise<string> {
    const { habitName, message } = params;

    const reminderMessage = message || `Don't forget to complete your habit: ${habitName}`;

    await prisma.proactiveInsight.create({
      data: {
        userId: event.userId,
        content: reminderMessage,
        category: "GROWTH",
        priority: "HIGH",
      },
    });

    return `Created habit reminder: ${habitName}`;
  }

  private async analyzeSpendingPattern(params: any, event: AutomationEvent): Promise<string> {
    // Get recent transactions for analysis
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId: event.userId,
        type: "Expense",
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    if (recentTransactions.length === 0) {
      return "No recent transactions to analyze";
    }

    // Simple spending analysis
    const totalSpent = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const categorySpending = recentTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)[0];

    const analysis = `In the last 30 days, you've spent $${totalSpent.toFixed(2)}. Your highest spending category is ${topCategory[0]} with $${topCategory[1].toFixed(2)}.`;

    await prisma.proactiveInsight.create({
      data: {
        userId: event.userId,
        content: analysis,
        category: "FINANCE",
        priority: "MEDIUM",
      },
    });

    return `Analyzed spending pattern: ${analysis}`;
  }

  private async suggestActivity(params: any, event: AutomationEvent): Promise<string> {
    const { mood, timeOfDay } = params;

    let suggestion = "";

    if (mood && mood < 5) {
      suggestion = "Since you're feeling down, consider a gentle activity like taking a walk, listening to music, or calling a friend.";
    } else if (timeOfDay === "morning") {
      suggestion = "Start your day with a positive activity like meditation, exercise, or setting intentions for the day.";
    } else if (timeOfDay === "evening") {
      suggestion = "Wind down with a relaxing activity like reading, journaling, or practicing gratitude.";
    } else {
      suggestion = "Consider engaging in an activity that brings you joy or helps you grow.";
    }

    await prisma.proactiveInsight.create({
      data: {
        userId: event.userId,
        content: suggestion,
        category: "WELLNESS",
        priority: "LOW",
      },
    });

    return `Suggested activity: ${suggestion}`;
  }

  private async createMoodCheckIn(params: any, event: AutomationEvent): Promise<string> {
    const { prompt } = params;

    const checkInPrompt = prompt || "How are you feeling right now? Take a moment to check in with yourself.";

    await prisma.proactiveInsight.create({
      data: {
        userId: event.userId,
        content: checkInPrompt,
        category: "WELLNESS",
        priority: "MEDIUM",
      },
    });

    return "Created mood check-in prompt";
  }
}

export const actionExecutor = ActionExecutor.getInstance();
