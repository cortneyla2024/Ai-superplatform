import { Agent, AgentResponse } from "../core/agent";
import { UserContext, EmotionalState } from "../core/master-conductor";

export interface Task {
  id: string;
  title: string;
  description: string;
  category: "personal" | "work" | "health" | "home" | "errands" | "learning";
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in-progress" | "completed" | "cancelled";
  dueDate?: Date;
  estimatedDuration: number; // in minutes
  tags: string[];
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  type: "morning" | "evening" | "daily" | "weekly";
  tasks: string[]; // task IDs
  isActive: boolean;
  lastCompleted?: Date;
  streak: number;
}

export interface Reminder {
  id: string;
  title: string;
  message: string;
  type: "task" | "appointment" | "medication" | "habit" | "general";
  dueDate: Date;
  isRecurring: boolean;
  recurrencePattern?: string;
  isCompleted: boolean;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: "health" | "productivity" | "wellness" | "learning" | "social";
  frequency: "daily" | "weekly" | "monthly";
  target: number;
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
}

export class DailyLivingAgent extends Agent {
  private tasks: Map<string, Task> = new Map();
  private routines: Map<string, Routine> = new Map();
  private reminders: Map<string, Reminder> = new Map();
  private habits: Map<string, Habit> = new Map();
  private userPreferences: Map<string, any> = new Map();

  constructor() {
    super(
      "daily-living",
      "Daily Living Agent",
      "Helps users manage daily tasks, routines, and practical life needs",
      [
        "task management",
        "routine optimization",
        "reminder system",
        "habit tracking",
        "time management",
        "productivity support",
        "life organization",
      ]
    );

    this.initializeDailyLivingResources();
  }

  private initializeDailyLivingResources(): void {
    // Initialize sample tasks
    this.tasks.set("morning-exercise", {
      id: "morning-exercise",
      title: "Morning Exercise",
      description: "30 minutes of physical activity to start the day",
      category: "health",
      priority: "high",
      status: "pending",
      estimatedDuration: 30,
      tags: ["exercise", "health", "morning"],
    });

    this.tasks.set("work-prep", {
      id: "work-prep",
      title: "Prepare for Work",
      description: "Review schedule, prepare materials, and set daily goals",
      category: "work",
      priority: "high",
      status: "pending",
      estimatedDuration: 15,
      tags: ["work", "preparation", "planning"],
    });

    this.tasks.set("grocery-shopping", {
      id: "grocery-shopping",
      title: "Grocery Shopping",
      description: "Buy groceries for the week",
      category: "errands",
      priority: "medium",
      status: "pending",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      estimatedDuration: 60,
      tags: ["shopping", "groceries", "errands"],
    });

    // Initialize sample routines
    this.routines.set("morning-routine", {
      id: "morning-routine",
      name: "Morning Routine",
      description: "Start the day with energy and focus",
      type: "morning",
      tasks: ["morning-exercise", "work-prep"],
      isActive: true,
      streak: 5,
    });

    this.routines.set("evening-routine", {
      id: "evening-routine",
      name: "Evening Routine",
      description: "Wind down and prepare for tomorrow",
      type: "evening",
      tasks: [],
      isActive: true,
      streak: 3,
    });

    // Initialize sample reminders
    this.reminders.set("medication-reminder", {
      id: "medication-reminder",
      title: "Take Medication",
      message: "Time to take your daily medication",
      type: "medication",
      dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      isRecurring: true,
      recurrencePattern: "daily",
      isCompleted: false,
    });

    this.reminders.set("appointment-reminder", {
      id: "appointment-reminder",
      title: "Doctor Appointment",
      message: "You have a doctor appointment in 1 hour",
      type: "appointment",
      dueDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      isRecurring: false,
      isCompleted: false,
    });

    // Initialize sample habits
    this.habits.set("daily-reading", {
      id: "daily-reading",
      name: "Daily Reading",
      description: "Read for at least 30 minutes each day",
      category: "learning",
      frequency: "daily",
      target: 30,
      currentStreak: 7,
      longestStreak: 15,
      isActive: true,
    });

    this.habits.set("water-intake", {
      id: "water-intake",
      name: "Water Intake",
      description: "Drink 8 glasses of water daily",
      category: "health",
      frequency: "daily",
      target: 8,
      currentStreak: 3,
      longestStreak: 10,
      isActive: true,
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
      // Analyze daily living needs
      const dailyNeeds = this.analyzeDailyLivingNeeds(input, emotionalState);

      // Generate appropriate response
      const response = await this.generateDailyLivingResponse(input, dailyNeeds, context);

      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(processingTime, response.confidence);

      return response;
    } catch (error) {
      console.error("Daily Living Agent processing error:", error);
      this.status.errorCount++;

      return {
        content: "I'm here to help you manage your daily tasks and routines. I'm experiencing some technical difficulties right now, but I can still assist you with your daily living needs.",
        confidence: 0.5,
        suggestedActions: ["View tasks", "Check routines", "Set reminders"],
        emotionalSupport: emotionalState,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          agentId: this.id,
        },
      };
    }
  }

  private analyzeDailyLivingNeeds(input: string, emotionalState: EmotionalState): {
    type: "task" | "routine" | "reminder" | "habit" | "organization" | "productivity";
    urgency: "low" | "medium" | "high";
    categories: string[];
  } {
    const inputLower = input.toLowerCase();

    let type: "task" | "routine" | "reminder" | "habit" | "organization" | "productivity" = "task";
    let urgency: "low" | "medium" | "high" = "medium";
    const categories: string[] = [];

    // Determine type of daily living need
    if (inputLower.includes("task") || inputLower.includes("todo") || inputLower.includes("do")) {
      type = "task";
    } else if (inputLower.includes("routine") || inputLower.includes("schedule") || inputLower.includes("daily")) {
      type = "routine";
    } else if (inputLower.includes("remind") || inputLower.includes("remember") || inputLower.includes("appointment")) {
      type = "reminder";
    } else if (inputLower.includes("habit") || inputLower.includes("track") || inputLower.includes("streak")) {
      type = "habit";
    } else if (inputLower.includes("organize") || inputLower.includes("clean") || inputLower.includes("sort")) {
      type = "organization";
    } else if (inputLower.includes("productive") || inputLower.includes("efficient") || inputLower.includes("time")) {
      type = "productivity";
    }

    // Determine urgency based on emotional state and keywords
    if (inputLower.includes("urgent") || inputLower.includes("asap") || inputLower.includes("emergency")) {
      urgency = "high";
    } else if (emotionalState.intensity > 0.7) {
      urgency = "high";
    } else if (inputLower.includes("soon") || inputLower.includes("today")) {
      urgency = "medium";
    } else {
      urgency = "low";
    }

    // Extract categories
    const categoryKeywords = ["personal", "work", "health", "home", "errands", "learning"];
    categoryKeywords.forEach(keyword => {
      if (inputLower.includes(keyword)) {
        categories.push(keyword);
      }
    });

    return { type, urgency, categories };
  }

  private async generateDailyLivingResponse(
    input: string,
    dailyNeeds: any,
    context: UserContext
  ): Promise<AgentResponse> {
    let content = "";
    let suggestedActions: string[] = [];

    switch (dailyNeeds.type) {
      case "task":
        content = await this.generateTaskResponse(dailyNeeds);
        suggestedActions = ["View tasks", "Add task", "Complete task"];
        break;

      case "routine":
        content = await this.generateRoutineResponse(dailyNeeds);
        suggestedActions = ["View routines", "Start routine", "Customize routine"];
        break;

      case "reminder":
        content = await this.generateReminderResponse(dailyNeeds);
        suggestedActions = ["Set reminder", "View reminders", "Edit reminder"];
        break;

      case "habit":
        content = await this.generateHabitResponse(dailyNeeds);
        suggestedActions = ["Track habit", "View habits", "Add habit"];
        break;

      case "organization":
        content = await this.generateOrganizationResponse(dailyNeeds);
        suggestedActions = ["Organize tasks", "Clean up", "Sort items"];
        break;

      case "productivity":
        content = await this.generateProductivityResponse(dailyNeeds);
        suggestedActions = ["Optimize routine", "Time block", "Set goals"];
        break;

      default:
        content = await this.generateGeneralDailyLivingResponse(dailyNeeds);
        suggestedActions = ["View dashboard", "Check tasks", "Start routine"];
    }

    // Add motivational support for high urgency
    if (dailyNeeds.urgency === "high") {
      content += " I understand this feels urgent. Let's break it down into manageable steps and tackle it together. You've got this!";
    }

    return {
      content,
      confidence: 0.85,
      suggestedActions,
      emotionalSupport: {
        primary: "supportive",
        intensity: 0.6,
        valence: 0.7,
        arousal: 0.5,
        confidence: 0.8,
        timestamp: new Date(),
      },
      metadata: {
        dailyNeeds,
        tasksCount: this.tasks.size,
        routinesCount: this.routines.size,
        remindersCount: this.reminders.size,
        habitsCount: this.habits.size,
        agentId: this.id,
      },
    };
  }

  private async generateTaskResponse(dailyNeeds: any): Promise<string> {
    const { urgency, categories } = dailyNeeds;

    let content = "I'm here to help you manage your tasks effectively! ";

    const pendingTasks = Array.from(this.tasks.values())
      .filter(task => task.status === "pending")
      .slice(0, 3);

    if (pendingTasks.length > 0) {
      content += `You have ${pendingTasks.length} pending tasks: `;
      pendingTasks.forEach(task => {
        const priorityEmoji = task.priority === "urgent" ? "🚨" : task.priority === "high" ? "⚡" : "📝";
        content += `${priorityEmoji} ${task.title} (${task.estimatedDuration} min), `;
      });
      content = content.slice(0, -2) + ". ";
    }

    if (urgency === "high") {
      content += "I recommend focusing on high-priority tasks first. ";
    }

    content += "I can help you create new tasks, organize existing ones, or track your progress. ";
    content += "What would you like to work on today?";

    return content;
  }

  private async generateRoutineResponse(dailyNeeds: any): Promise<string> {
    let content = "Routines are the foundation of a productive and balanced life! ";

    const activeRoutines = Array.from(this.routines.values())
      .filter(routine => routine.isActive)
      .slice(0, 2);

    if (activeRoutines.length > 0) {
      content += "Your active routines: ";
      activeRoutines.forEach(routine => {
        content += `"${routine.name}" (${routine.streak} day streak), `;
      });
      content = content.slice(0, -2) + ". ";
    }

    content += "I can help you create new routines, optimize existing ones, or track your consistency. ";
    content += "Would you like to start a routine, check your progress, or create a new one?";

    return content;
  }

  private async generateReminderResponse(dailyNeeds: any): Promise<string> {
    const { urgency } = dailyNeeds;

    let content = "Never miss an important moment with smart reminders! ";

    const upcomingReminders = Array.from(this.reminders.values())
      .filter(reminder => !reminder.isCompleted && reminder.dueDate > new Date())
      .slice(0, 3);

    if (upcomingReminders.length > 0) {
      content += "Upcoming reminders: ";
      upcomingReminders.forEach(reminder => {
        const hoursUntil = Math.ceil((reminder.dueDate.getTime() - Date.now()) / (1000 * 60 * 60));
        content += `"${reminder.title}" (${hoursUntil} hours), `;
      });
      content = content.slice(0, -2) + ". ";
    }

    if (urgency === "high") {
      content += "I can set up immediate reminders for urgent matters. ";
    }

    content += "I can help you set new reminders, manage existing ones, or create recurring notifications. ";
    content += "What would you like to be reminded about?";

    return content;
  }

  private async generateHabitResponse(dailyNeeds: any): Promise<string> {
    let content = "Building positive habits is the key to lasting change! ";

    const activeHabits = Array.from(this.habits.values())
      .filter(habit => habit.isActive)
      .slice(0, 2);

    if (activeHabits.length > 0) {
      content += "Your active habits: ";
      activeHabits.forEach(habit => {
        content += `"${habit.name}" (${habit.currentStreak} day streak, longest: ${habit.longestStreak}), `;
      });
      content = content.slice(0, -2) + ". ";
    }

    content += "I can help you track your habits, celebrate your progress, or start new ones. ";
    content += "Would you like to check your habit progress or start tracking a new habit?";

    return content;
  }

  private async generateOrganizationResponse(dailyNeeds: any): Promise<string> {
    let content = "A well-organized life leads to less stress and more productivity! ";

    content += "I can help you organize: ";
    content += "• Your tasks by priority and category ";
    content += "• Your daily routines for maximum efficiency ";
    content += "• Your reminders and appointments ";
    content += "• Your habits and goals ";
    content += "• Your time and energy ";

    content += "Let's create a system that works perfectly for you. ";
    content += "What area of your life would you like to organize first?";

    return content;
  }

  private async generateProductivityResponse(dailyNeeds: any): Promise<string> {
    let content = "Let's maximize your productivity and make the most of your time! ";

    content += "I can help you: ";
    content += "• Optimize your daily routines ";
    content += "• Implement time-blocking techniques ";
    content += "• Set SMART goals ";
    content += "• Track your productivity metrics ";
    content += "• Eliminate time-wasting activities ";
    content += "• Create focused work sessions ";

    content += "Productivity is about working smarter, not harder. ";
    content += "What productivity challenge would you like to tackle today?";

    return content;
  }

  private async generateGeneralDailyLivingResponse(dailyNeeds: any): Promise<string> {
    let content = "I'm your personal assistant for daily living and productivity! ";

    content += "I can help you with: ";
    content += "• Managing tasks and to-dos ";
    content += "• Creating and following routines ";
    content += "• Setting and tracking reminders ";
    content += "• Building positive habits ";
    content += "• Organizing your life ";
    content += "• Boosting your productivity ";

    content += "Let's make your daily life easier and more fulfilling. ";
    content += "What would you like to work on today?";

    return content;
  }

  async getTasks(status?: Task["status"], category?: Task["category"]): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values());
    let filtered = tasks;

    if (status) {
      filtered = filtered.filter(task => task.status === status);
    }

    if (category) {
      filtered = filtered.filter(task => task.category === category);
    }

    return filtered;
  }

  async getRoutines(type?: Routine["type"]): Promise<Routine[]> {
    const routines = Array.from(this.routines.values());
    return type ? routines.filter(r => r.type === type) : routines;
  }

  async getReminders(upcoming?: boolean): Promise<Reminder[]> {
    const reminders = Array.from(this.reminders.values());
    if (upcoming) {
      return reminders.filter(r => !r.isCompleted && r.dueDate > new Date());
    }
    return reminders;
  }

  async getHabits(active?: boolean): Promise<Habit[]> {
    const habits = Array.from(this.habits.values());
    return active !== undefined ? habits.filter(h => h.isActive === active) : habits;
  }

  async createTask(taskData: Omit<Task, "id">): Promise<Task> {
    const id = `task-${Date.now()}`;
    const task: Task = { ...taskData, id };
    this.tasks.set(id, task);
    return task;
  }

  async updateTaskStatus(taskId: string, status: Task["status"]): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      return true;
    }
    return false;
  }

  async createReminder(reminderData: Omit<Reminder, "id">): Promise<Reminder> {
    const id = `reminder-${Date.now()}`;
    const reminder: Reminder = { ...reminderData, id };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async trackHabit(habitId: string): Promise<boolean> {
    const habit = this.habits.get(habitId);
    if (habit) {
      habit.currentStreak++;
      if (habit.currentStreak > habit.longestStreak) {
        habit.longestStreak = habit.currentStreak;
      }
      return true;
    }
    return false;
  }

  async startRoutine(routineId: string): Promise<boolean> {
    const routine = this.routines.get(routineId);
    if (routine && routine.isActive) {
      routine.lastCompleted = new Date();
      routine.streak++;
      return true;
    }
    return false;
  }
}
