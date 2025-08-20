import { db } from "../db/file-db";

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  event: string;
  data: any;
  timestamp: string;
}

export interface EventSummary {
  event: string;
  count: number;
  lastOccurrence: string;
  uniqueUsers: number;
}

export class AnalyticsTracker {
  async logEvent(userId: string | undefined, event: string, data: any = {}): Promise<void> {
    try {
      await db.logEvent({
        userId,
        event,
        data,
      });
    } catch (error) {
      console.error("Error logging analytics event:", error);
    }
  }

  async logPageView(userId: string | undefined, page: string): Promise<void> {
    await this.logEvent(userId, "page_view", { page });
  }

  async logUserAction(userId: string | undefined, action: string, details: any = {}): Promise<void> {
    await this.logEvent(userId, "user_action", { action, ...details });
  }

  async logAIIntraction(userId: string | undefined, type: string, details: any = {}): Promise<void> {
    await this.logEvent(userId, "ai_interaction", { type, ...details });
  }

  async logMusicGeneration(userId: string | undefined, prompt: string, success: boolean): Promise<void> {
    await this.logEvent(userId, "music_generation", { prompt, success });
  }

  async logSearch(userId: string | undefined, query: string, resultCount: number): Promise<void> {
    await this.logEvent(userId, "search", { query, resultCount });
  }

  async logError(userId: string | undefined, error: string, context: any = {}): Promise<void> {
    await this.logEvent(userId, "error", { error, context });
  }

  async getEventSummary(event: string, days: number = 7): Promise<EventSummary | null> {
    try {
      const events = await db.getAnalyticsEvents();
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const filteredEvents = events.filter(event =>
        event.event === event && new Date(event.timestamp) >= cutoffDate
      );

      if (filteredEvents.length === 0) {
        return null;
      }

      const uniqueUsers = new Set(filteredEvents.map(e => e.userId).filter(Boolean)).size;
      const lastOccurrence = filteredEvents[0].timestamp;

      return {
        event,
        count: filteredEvents.length,
        lastOccurrence,
        uniqueUsers,
      };
    } catch (error) {
      console.error("Error getting event summary:", error);
      return null;
    }
  }

  async getPopularEvents(days: number = 7, limit: number = 10): Promise<Array<{ event: string; count: number }>> {
    try {
      const events = await db.getAnalyticsEvents();
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const filteredEvents = events.filter(event =>
        new Date(event.timestamp) >= cutoffDate
      );

      const eventCounts: { [event: string]: number } = {};
      filteredEvents.forEach(event => {
        eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
      });

      return Object.entries(eventCounts)
        .map(([event, count]) => ({ event, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting popular events:", error);
      return [];
    }
  }

  async getUserActivity(userId: string, days: number = 7): Promise<AnalyticsEvent[]> {
    try {
      const events = await db.getAnalyticsEvents(userId);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      return events.filter(event => new Date(event.timestamp) >= cutoffDate);
    } catch (error) {
      console.error("Error getting user activity:", error);
      return [];
    }
  }

  async getDailyStats(days: number = 7): Promise<Array<{ date: string; events: number; users: number }>> {
    try {
      const events = await db.getAnalyticsEvents();
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const filteredEvents = events.filter(event =>
        new Date(event.timestamp) >= cutoffDate
      );

      const dailyStats: { [date: string]: { events: number; users: Set<string> } } = {};

      filteredEvents.forEach(event => {
        const date = new Date(event.timestamp).toISOString().split("T")[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { events: 0, users: new Set() };
        }
        dailyStats[date].events++;
        if (event.userId) {
          dailyStats[date].users.add(event.userId);
        }
      });

      return Object.entries(dailyStats)
        .map(([date, stats]) => ({
          date,
          events: stats.events,
          users: stats.users.size,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error("Error getting daily stats:", error);
      return [];
    }
  }
}
