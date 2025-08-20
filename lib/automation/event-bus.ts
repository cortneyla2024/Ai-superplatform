import { EventEmitter } from "events";

// Global event bus for automation system
export const eventBus = new EventEmitter();

// Event types
export const EVENT_TYPES = {
  MOOD_LOGGED: "mood:logged",
  TRANSACTION_CREATED: "transaction:created",
  HABIT_COMPLETED: "habit:completed",
  GOAL_UPDATED: "goal:updated",
  AUTOMATION_TRIGGERED: "automation:triggered",
  WELLNESS_CHECK: "wellness:check",
  SYSTEM_HEALTH: "system:health",
} as const;

// Event interfaces
export interface MoodLoggedEvent {
  userId: string;
  moodScore: number;
  timestamp: Date;
}

export interface TransactionCreatedEvent {
  userId: string;
  amount: number;
  type: "Income" | "Expense";
  category: string;
  timestamp: Date;
}

export interface HabitCompletedEvent {
  userId: string;
  habitId: string;
  habitName: string;
  timestamp: Date;
}

// Legacy function for backward compatibility
export function emitAutomationEvent(
  type: string,
  userId: string,
  data: any
): void {
  const event = {
    type,
    userId,
    data,
    timestamp: new Date(),
  };
  eventBus.emit(type, event);
  eventBus.emit("automation", event);
}

// Emit events
export function emitMoodLogged(data: MoodLoggedEvent) {
  eventBus.emit(EVENT_TYPES.MOOD_LOGGED, data);
}

export function emitTransactionCreated(data: TransactionCreatedEvent) {
  eventBus.emit(EVENT_TYPES.TRANSACTION_CREATED, data);
}

export function emitHabitCompleted(data: HabitCompletedEvent) {
  eventBus.emit(EVENT_TYPES.HABIT_COMPLETED, data);
}

// Listen for events
export function onMoodLogged(callback: (data: MoodLoggedEvent) => void) {
  eventBus.on(EVENT_TYPES.MOOD_LOGGED, callback);
}

export function onTransactionCreated(callback: (data: TransactionCreatedEvent) => void) {
  eventBus.on(EVENT_TYPES.TRANSACTION_CREATED, callback);
}

export function onHabitCompleted(callback: (data: HabitCompletedEvent) => void) {
  eventBus.on(EVENT_TYPES.HABIT_COMPLETED, callback);
}
