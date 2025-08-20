import { Agent, AgentResponse } from "../core/agent";
import { UserContext, EmotionalState } from "../core/master-conductor";

export interface FinancialAccount {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit" | "investment" | "retirement";
  balance: number;
  currency: string;
  institution: string;
  isActive: boolean;
  lastUpdated: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: "income" | "expense" | "transfer";
  category: "food" | "transportation" | "entertainment" | "utilities" | "healthcare" | "education" | "shopping" | "salary" | "investment" | "other";
  amount: number;
  description: string;
  date: Date;
  tags: string[];
}

export interface Budget {
  id: string;
  name: string;
  period: "weekly" | "monthly" | "yearly";
  categories: Map<string, { limit: number; spent: number }>;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface FinancialGoal {
  id: string;
  name: string;
  type: "savings" | "debt" | "investment" | "emergency" | "retirement" | "purchase";
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  priority: "low" | "medium" | "high";
  isActive: boolean;
  progress: number; // percentage
}

export interface FinancialInsight {
  id: string;
  title: string;
  description: string;
  type: "spending" | "saving" | "investment" | "debt" | "income" | "trend";
  severity: "positive" | "neutral" | "warning" | "critical";
  actionable: boolean;
  recommendation?: string;
}

export class FinancialWellnessAgent extends Agent {
  private accounts: Map<string, FinancialAccount> = new Map();
  private transactions: Map<string, Transaction[]> = new Map();
  private budgets: Map<string, Budget> = new Map();
  private goals: Map<string, FinancialGoal> = new Map();
  private insights: Map<string, FinancialInsight> = new Map();
  private userPreferences: Map<string, any> = new Map();

  constructor() {
    super(
      "financial-wellness",
      "Financial Wellness Agent",
      "Helps users manage finances, build wealth, and achieve financial security",
      [
        "budget management",
        "expense tracking",
        "financial planning",
        "investment guidance",
        "debt management",
        "savings strategies",
        "financial education",
      ]
    );

    this.initializeFinancialResources();
  }

  private initializeFinancialResources(): void {
    // Initialize sample financial accounts
    this.accounts.set("checking-main", {
      id: "checking-main",
      name: "Main Checking",
      type: "checking",
      balance: 2500.00,
      currency: "USD",
      institution: "Local Bank",
      isActive: true,
      lastUpdated: new Date(),
    });

    this.accounts.set("savings-emergency", {
      id: "savings-emergency",
      name: "Emergency Fund",
      type: "savings",
      balance: 8000.00,
      currency: "USD",
      institution: "Local Bank",
      isActive: true,
      lastUpdated: new Date(),
    });

    this.accounts.set("credit-card", {
      id: "credit-card",
      name: "Credit Card",
      type: "credit",
      balance: -1200.00,
      currency: "USD",
      institution: "Credit Union",
      isActive: true,
      lastUpdated: new Date(),
    });

    // Initialize sample transactions
    const userId = "default-user";
    this.transactions.set(userId, [
      {
        id: "tx-1",
        accountId: "checking-main",
        type: "income",
        category: "salary",
        amount: 3000.00,
        description: "Monthly salary",
        date: new Date(),
        tags: ["income", "salary"],
      },
      {
        id: "tx-2",
        accountId: "checking-main",
        type: "expense",
        category: "food",
        amount: -150.00,
        description: "Grocery shopping",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        tags: ["food", "groceries"],
      },
      {
        id: "tx-3",
        accountId: "credit-card",
        type: "expense",
        category: "entertainment",
        amount: -75.00,
        description: "Movie tickets and dinner",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        tags: ["entertainment", "dining"],
      },
    ]);

    // Initialize sample budget
    this.budgets.set("monthly-budget", {
      id: "monthly-budget",
      name: "Monthly Budget",
      period: "monthly",
      categories: new Map([
        ["food", { limit: 400, spent: 150 }],
        ["transportation", { limit: 200, spent: 120 }],
        ["entertainment", { limit: 150, spent: 75 }],
        ["utilities", { limit: 300, spent: 280 }],
        ["savings", { limit: 500, spent: 500 }],
      ]),
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      isActive: true,
    });

    // Initialize sample financial goals
    this.goals.set("emergency-fund", {
      id: "emergency-fund",
      name: "Emergency Fund",
      type: "emergency",
      targetAmount: 10000,
      currentAmount: 8000,
      deadline: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months
      priority: "high",
      isActive: true,
      progress: 80,
    });

    this.goals.set("vacation-savings", {
      id: "vacation-savings",
      name: "Vacation Fund",
      type: "savings",
      targetAmount: 3000,
      currentAmount: 1200,
      deadline: new Date(Date.now() + 4 * 30 * 24 * 60 * 60 * 1000), // 4 months
      priority: "medium",
      isActive: true,
      progress: 40,
    });

    this.goals.set("debt-payoff", {
      id: "debt-payoff",
      name: "Credit Card Payoff",
      type: "debt",
      targetAmount: 0,
      currentAmount: -1200,
      deadline: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000), // 3 months
      priority: "high",
      isActive: true,
      progress: 0,
    });

    // Initialize sample financial insights
    this.insights.set("spending-trend", {
      id: "spending-trend",
      title: "Spending Trend Analysis",
      description: "Your entertainment spending is 20% higher than last month",
      type: "spending",
      severity: "warning",
      actionable: true,
      recommendation: "Consider setting a stricter entertainment budget for the rest of the month",
    });

    this.insights.set("savings-progress", {
      id: "savings-progress",
      title: "Great Savings Progress!",
      description: "You're on track to reach your emergency fund goal ahead of schedule",
      type: "saving",
      severity: "positive",
      actionable: false,
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
      // Analyze financial wellness needs
      const financialNeeds = this.analyzeFinancialNeeds(input, emotionalState);

      // Generate appropriate response
      const response = await this.generateFinancialResponse(input, financialNeeds, context);

      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(processingTime, response.confidence);

      return response;
    } catch (error) {
      console.error("Financial Wellness Agent processing error:", error);
      this.status.errorCount++;

      return {
        content: "I'm here to help you achieve financial wellness and security. I'm experiencing some technical difficulties right now, but I can still assist you with your financial needs.",
        confidence: 0.5,
        suggestedActions: ["View accounts", "Check budget", "Track expenses"],
        emotionalSupport: emotionalState,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          agentId: this.id,
        },
      };
    }
  }

  private analyzeFinancialNeeds(input: string, emotionalState: EmotionalState): {
    type: "budget" | "tracking" | "goals" | "insights" | "planning" | "education";
    urgency: "low" | "medium" | "high";
    categories: Transaction["category"][];
  } {
    const inputLower = input.toLowerCase();

    let type: "budget" | "tracking" | "goals" | "insights" | "planning" | "education" = "tracking";
    let urgency: "low" | "medium" | "high" = "medium";
    const categories: Transaction["category"][] = [];

    // Determine type of financial need
    if (inputLower.includes("budget") || inputLower.includes("spending limit") || inputLower.includes("limit")) {
      type = "budget";
    } else if (inputLower.includes("track") || inputLower.includes("expense") || inputLower.includes("transaction")) {
      type = "tracking";
    } else if (inputLower.includes("goal") || inputLower.includes("save") || inputLower.includes("target")) {
      type = "goals";
    } else if (inputLower.includes("insight") || inputLower.includes("analysis") || inputLower.includes("trend")) {
      type = "insights";
    } else if (inputLower.includes("plan") || inputLower.includes("future") || inputLower.includes("strategy")) {
      type = "planning";
    } else if (inputLower.includes("learn") || inputLower.includes("education") || inputLower.includes("advice")) {
      type = "education";
    }

    // Determine urgency based on emotional state and keywords
    if (inputLower.includes("emergency") || inputLower.includes("urgent") || inputLower.includes("crisis")) {
      urgency = "high";
    } else if (emotionalState.intensity > 0.8 && emotionalState.valence < 0.3) {
      urgency = "high";
    } else if (inputLower.includes("worry") || inputLower.includes("concern") || inputLower.includes("stress")) {
      urgency = "medium";
    } else {
      urgency = "low";
    }

    // Extract spending categories
    const categoryKeywords = [
      { keyword: "food", category: "food" },
      { keyword: "transport", category: "transportation" },
      { keyword: "entertainment", category: "entertainment" },
      { keyword: "utility", category: "utilities" },
      { keyword: "health", category: "healthcare" },
      { keyword: "education", category: "education" },
      { keyword: "shop", category: "shopping" },
      { keyword: "salary", category: "salary" },
      { keyword: "investment", category: "investment" },
    ];

    categoryKeywords.forEach(({ keyword, category }) => {
      if (inputLower.includes(keyword)) {
        categories.push(category as Transaction["category"]);
      }
    });

    return { type, urgency, categories };
  }

  private async generateFinancialResponse(
    input: string,
    financialNeeds: any,
    context: UserContext
  ): Promise<AgentResponse> {
    let content = "";
    let suggestedActions: string[] = [];

    switch (financialNeeds.type) {
      case "budget":
        content = await this.generateBudgetResponse(financialNeeds);
        suggestedActions = ["View budget", "Set budget", "Adjust limits"];
        break;

      case "tracking":
        content = await this.generateTrackingResponse(financialNeeds);
        suggestedActions = ["Log transaction", "View expenses", "Track spending"];
        break;

      case "goals":
        content = await this.generateGoalsResponse(financialNeeds);
        suggestedActions = ["View goals", "Set goal", "Update progress"];
        break;

      case "insights":
        content = await this.generateInsightsResponse(financialNeeds);
        suggestedActions = ["View insights", "Get analysis", "Review trends"];
        break;

      case "planning":
        content = await this.generatePlanningResponse(financialNeeds);
        suggestedActions = ["Financial plan", "Investment strategy", "Retirement planning"];
        break;

      case "education":
        content = await this.generateEducationResponse(financialNeeds);
        suggestedActions = ["Learn finance", "Get advice", "Read resources"];
        break;

      default:
        content = await this.generateGeneralFinancialResponse(financialNeeds);
        suggestedActions = ["Financial dashboard", "Track money", "Set goals"];
    }

    // Add financial reassurance for high urgency
    if (financialNeeds.urgency === "high") {
      content += " I understand financial stress can be overwhelming. Let's work together to create a plan that gives you peace of mind. You're taking the right steps by seeking help.";
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
        financialNeeds,
        accountsCount: this.accounts.size,
        budgetsCount: this.budgets.size,
        goalsCount: this.goals.size,
        insightsCount: this.insights.size,
        agentId: this.id,
      },
    };
  }

  private async generateBudgetResponse(financialNeeds: any): Promise<string> {
    const { urgency } = financialNeeds;

    let content = "Let's take control of your spending with smart budgeting! ";

    const activeBudgets = Array.from(this.budgets.values())
      .filter(budget => budget.isActive)
      .slice(0, 1);

    if (activeBudgets.length > 0) {
      const budget = activeBudgets[0];
      content += `Your current ${budget.period} budget: `;

      let totalSpent = 0;
      let totalLimit = 0;

      budget.categories.forEach((category, name) => {
        const percentage = (category.spent / category.limit) * 100;
        const statusEmoji = percentage > 90 ? "🚨" : percentage > 75 ? "⚠️" : "✅";
        content += `${statusEmoji} ${name}: $${category.spent}/${category.limit}, `;
        totalSpent += category.spent;
        totalLimit += category.limit;
      });

      const overallPercentage = (totalSpent / totalLimit) * 100;
      content = content.slice(0, -2) + `. Overall: ${overallPercentage.toFixed(1)}% of budget used. `;
    }

    if (urgency === "high") {
      content += "I can help you create a strict budget to get back on track quickly. ";
    }

    content += "I can help you create budgets, track spending, and adjust limits. ";
    content += "What aspect of budgeting would you like to focus on?";

    return content;
  }

  private async generateTrackingResponse(financialNeeds: any): Promise<string> {
    const { categories } = financialNeeds;

    let content = "Tracking your money is the first step to financial freedom! ";

    const recentTransactions = this.getRecentTransactions("default-user", 3);
    if (recentTransactions.length > 0) {
      content += "Recent transactions: ";
      recentTransactions.forEach(transaction => {
        const amountEmoji = transaction.amount > 0 ? "💰" : "💸";
        content += `${amountEmoji} ${transaction.description}: $${Math.abs(transaction.amount).toFixed(2)}, `;
      });
      content = content.slice(0, -2) + ". ";
    }

    if (categories.length > 0) {
      content += `I can help you track ${categories.join(", ")} expenses specifically. `;
    }

    content += "I can help you log transactions, categorize spending, and identify patterns. ";
    content += "What would you like to track today?";

    return content;
  }

  private async generateGoalsResponse(financialNeeds: any): Promise<string> {
    let content = "Financial goals give your money purpose and direction! ";

    const activeGoals = Array.from(this.goals.values())
      .filter(goal => goal.isActive)
      .slice(0, 3);

    if (activeGoals.length > 0) {
      content += "Your active goals: ";
      activeGoals.forEach(goal => {
        const progressEmoji = goal.progress >= 80 ? "🎉" : goal.progress >= 50 ? "📈" : "🎯";
        const amount = goal.type === "debt" ? Math.abs(goal.currentAmount) : goal.currentAmount;
        const target = goal.type === "debt" ? 0 : goal.targetAmount;
        content += `${progressEmoji} ${goal.name}: $${amount.toFixed(2)}/${target.toFixed(2)} (${goal.progress}%), `;
      });
      content = content.slice(0, -2) + ". ";
    }

    content += "I can help you set SMART financial goals, track progress, and celebrate achievements. ";
    content += "What financial goal would you like to work on?";

    return content;
  }

  private async generateInsightsResponse(financialNeeds: any): Promise<string> {
    let content = "Understanding your financial patterns is key to making better decisions! ";

    const actionableInsights = Array.from(this.insights.values())
      .filter(insight => insight.actionable)
      .slice(0, 2);

    if (actionableInsights.length > 0) {
      content += "Key insights: ";
      actionableInsights.forEach(insight => {
        const severityEmoji = insight.severity === "critical" ? "🚨" : insight.severity === "warning" ? "⚠️" : insight.severity === "positive" ? "✅" : "ℹ️";
        content += `${severityEmoji} ${insight.title}: ${insight.description}, `;
      });
      content = content.slice(0, -2) + ". ";
    }

    content += "I can analyze your spending patterns, identify opportunities, and provide personalized recommendations. ";
    content += "What type of financial insight would you like to explore?";

    return content;
  }

  private async generatePlanningResponse(financialNeeds: any): Promise<string> {
    let content = "Financial planning is about creating the future you want! ";

    content += "I can help you with: ";
    content += "• Short-term financial planning (monthly budgets) ";
    content += "• Medium-term goals (savings, debt payoff) ";
    content += "• Long-term planning (retirement, investments) ";
    content += "• Emergency fund strategies ";
    content += "• Investment portfolio planning ";
    content += "• Tax optimization strategies ";

    content += "Let's create a comprehensive financial plan that aligns with your goals and values. ";
    content += "What aspect of financial planning interests you most?";

    return content;
  }

  private async generateEducationResponse(financialNeeds: any): Promise<string> {
    let content = "Financial education is the foundation of lasting wealth! ";

    content += "I can teach you about: ";
    content += "• Budgeting fundamentals ";
    content += "• Saving strategies ";
    content += "• Debt management ";
    content += "• Investment basics ";
    content += "• Credit score improvement ";
    content += "• Tax planning ";
    content += "• Insurance and protection ";

    content += "Knowledge is power when it comes to your finances. ";
    content += "What financial topic would you like to learn about?";

    return content;
  }

  private async generateGeneralFinancialResponse(financialNeeds: any): Promise<string> {
    let content = "Welcome to your financial wellness journey! I'm here to help you build wealth and security. ";

    content += "I can help you with: ";
    content += "• Creating and managing budgets ";
    content += "• Tracking expenses and income ";
    content += "• Setting and achieving financial goals ";
    content += "• Understanding your financial patterns ";
    content += "• Planning for your financial future ";
    content += "• Learning about personal finance ";

    content += "Financial wellness is about more than just money - it's about peace of mind and freedom. ";
    content += "What would you like to work on today?";

    return content;
  }

  private getRecentTransactions(userId: string, limit: number): Transaction[] {
    const userTransactions = this.transactions.get(userId) || [];
    return userTransactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  async getAccounts(userId: string): Promise<FinancialAccount[]> {
    return Array.from(this.accounts.values());
  }

  async getTransactions(userId: string, days?: number): Promise<Transaction[]> {
    const userTransactions = this.transactions.get(userId) || [];
    let filtered = userTransactions;

    if (days) {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(transaction => transaction.date >= cutoffDate);
    }

    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getBudgets(userId: string): Promise<Budget[]> {
    return Array.from(this.budgets.values());
  }

  async getGoals(userId: string): Promise<FinancialGoal[]> {
    return Array.from(this.goals.values());
  }

  async getInsights(userId: string, actionable?: boolean): Promise<FinancialInsight[]> {
    const insights = Array.from(this.insights.values());
    return actionable !== undefined ? insights.filter(insight => insight.actionable === actionable) : insights;
  }

  async addTransaction(userId: string, transactionData: Omit<Transaction, "id">): Promise<Transaction> {
    const id = `tx-${Date.now()}`;
    const transaction: Transaction = { ...transactionData, id };

    const userTransactions = this.transactions.get(userId) || [];
    userTransactions.push(transaction);
    this.transactions.set(userId, userTransactions);

    // Update account balance
    this.updateAccountBalance(transaction.accountId, transaction.amount);

    // Generate insights based on new transaction
    this.generateInsightsFromTransaction(userId, transaction);

    return transaction;
  }

  async updateGoalProgress(goalId: string, currentAmount: number): Promise<boolean> {
    const goal = this.goals.get(goalId);
    if (goal) {
      goal.currentAmount = currentAmount;
      goal.progress = Math.min(100, Math.max(0, (currentAmount / goal.targetAmount) * 100));
      return true;
    }
    return false;
  }

  async createBudget(budgetData: Omit<Budget, "id">): Promise<Budget> {
    const id = `budget-${Date.now()}`;
    const budget: Budget = { ...budgetData, id };
    this.budgets.set(id, budget);
    return budget;
  }

  private updateAccountBalance(accountId: string, amount: number): void {
    const account = this.accounts.get(accountId);
    if (account) {
      account.balance += amount;
      account.lastUpdated = new Date();
    }
  }

  private generateInsightsFromTransaction(userId: string, transaction: Transaction): void {
    // Example insight generation logic
    if (transaction.type === "expense" && transaction.amount < -200) {
      this.createFinancialInsight({
        title: "Large Expense Alert",
        description: `You had a large expense of $${Math.abs(transaction.amount).toFixed(2)} in ${transaction.category}`,
        type: "spending",
        severity: "warning",
        actionable: true,
        recommendation: "Review if this expense was necessary and consider setting spending limits for this category",
      });
    }
  }

  private createFinancialInsight(insightData: Omit<FinancialInsight, "id">): void {
    const id = `insight-${Date.now()}`;
    const insight: FinancialInsight = { ...insightData, id };
    this.insights.set(id, insight);
  }
}
