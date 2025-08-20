import { Agent, AgentResponse } from "../core/agent";
import { UserContext, EmotionalState } from "../core/master-conductor";

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  tags: string[];
  activityLevel: "low" | "medium" | "high";
  privacy: "public" | "private" | "invite-only";
}

export interface Mentor {
  id: string;
  name: string;
  expertise: string[];
  experience: number;
  rating: number;
  availability: "available" | "busy" | "unavailable";
  bio: string;
}

export interface SocialEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  type: "online" | "in-person" | "hybrid";
  attendees: number;
  maxAttendees: number;
  tags: string[];
}

export class SocialConnectionAgent extends Agent {
  private communities: Map<string, Community> = new Map();
  private mentors: Map<string, Mentor> = new Map();
  private events: Map<string, SocialEvent> = new Map();
  private userConnections: Map<string, any> = new Map();

  constructor() {
    super(
      "social-connection",
      "Social Connection Agent",
      "Helps users build meaningful relationships and find communities",
      [
        "community discovery",
        "mentorship matching",
        "event recommendations",
        "relationship building",
        "social skills development",
        "networking support",
      ]
    );

    this.initializeSocialResources();
  }

  private initializeSocialResources(): void {
    // Initialize sample communities
    this.communities.set("tech-enthusiasts", {
      id: "tech-enthusiasts",
      name: "Tech Enthusiasts",
      description: "A community for technology lovers to share knowledge and experiences",
      category: "technology",
      memberCount: 1250,
      tags: ["technology", "programming", "innovation"],
      activityLevel: "high",
      privacy: "public",
    });

    this.communities.set("mental-health-support", {
      id: "mental-health-support",
      name: "Mental Health Support Group",
      description: "A safe space for discussing mental health and supporting each other",
      category: "health",
      memberCount: 890,
      tags: ["mental health", "support", "wellness"],
      activityLevel: "medium",
      privacy: "private",
    });

    this.communities.set("creative-writers", {
      id: "creative-writers",
      name: "Creative Writers Circle",
      description: "A community for writers to share their work and get feedback",
      category: "creative",
      memberCount: 567,
      tags: ["writing", "creative", "literature"],
      activityLevel: "medium",
      privacy: "public",
    });

    // Initialize sample mentors
    this.mentors.set("sarah-tech", {
      id: "sarah-tech",
      name: "Sarah Johnson",
      expertise: ["software development", "AI", "machine learning"],
      experience: 8,
      rating: 4.8,
      availability: "available",
      bio: "Senior software engineer with expertise in AI and machine learning. Passionate about helping others learn and grow.",
    });

    this.mentors.set("mike-wellness", {
      id: "mike-wellness",
      name: "Mike Chen",
      expertise: ["mental health", "wellness", "mindfulness"],
      experience: 12,
      rating: 4.9,
      availability: "available",
      bio: "Licensed therapist specializing in mental health and wellness. Dedicated to supporting others on their wellness journey.",
    });

    // Initialize sample events
    this.events.set("tech-meetup", {
      id: "tech-meetup",
      title: "AI and Future of Technology",
      description: "Join us for an evening discussing the latest developments in AI and their impact on our future",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      location: "Online",
      type: "online",
      attendees: 45,
      maxAttendees: 100,
      tags: ["technology", "AI", "future"],
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
      // Analyze social needs
      const socialNeeds = this.analyzeSocialNeeds(input, emotionalState);

      // Generate appropriate response
      const response = await this.generateSocialResponse(input, socialNeeds, context);

      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(processingTime, response.confidence);

      return response;
    } catch (error) {
      console.error("Social Connection Agent processing error:", error);
      this.status.errorCount++;

      return {
        content: "I'm here to help you build meaningful connections and find communities. I'm experiencing some technical difficulties right now, but I can still assist you with your social needs.",
        confidence: 0.5,
        suggestedActions: ["Browse communities", "Find mentors", "Join events"],
        emotionalSupport: emotionalState,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          agentId: this.id,
        },
      };
    }
  }

  private analyzeSocialNeeds(input: string, emotionalState: EmotionalState): {
    type: "community" | "mentorship" | "event" | "relationship" | "skills";
    urgency: "low" | "medium" | "high";
    interests: string[];
  } {
    const inputLower = input.toLowerCase();

    let type: "community" | "mentorship" | "event" | "relationship" | "skills" = "community";
    let urgency: "low" | "medium" | "high" = "medium";
    const interests: string[] = [];

    // Determine type of social need
    if (inputLower.includes("community") || inputLower.includes("group") || inputLower.includes("people like me")) {
      type = "community";
    } else if (inputLower.includes("mentor") || inputLower.includes("guide") || inputLower.includes("expert")) {
      type = "mentorship";
    } else if (inputLower.includes("event") || inputLower.includes("meetup") || inputLower.includes("gathering")) {
      type = "event";
    } else if (inputLower.includes("friend") || inputLower.includes("relationship") || inputLower.includes("connect")) {
      type = "relationship";
    } else if (inputLower.includes("skill") || inputLower.includes("learn") || inputLower.includes("improve")) {
      type = "skills";
    }

    // Determine urgency based on emotional state
    if (emotionalState.intensity > 0.8 && emotionalState.valence < 0.3) {
      urgency = "high";
    } else if (emotionalState.intensity > 0.6) {
      urgency = "medium";
    } else {
      urgency = "low";
    }

    // Extract interests
    const interestKeywords = ["technology", "health", "creative", "business", "sports", "music", "art", "science"];
    interestKeywords.forEach(keyword => {
      if (inputLower.includes(keyword)) {
        interests.push(keyword);
      }
    });

    return { type, urgency, interests };
  }

  private async generateSocialResponse(
    input: string,
    socialNeeds: any,
    context: UserContext
  ): Promise<AgentResponse> {
    let content = "";
    let suggestedActions: string[] = [];

    switch (socialNeeds.type) {
      case "community":
        content = await this.generateCommunityResponse(socialNeeds);
        suggestedActions = ["Browse communities", "Join a group", "Create community"];
        break;

      case "mentorship":
        content = await this.generateMentorshipResponse(socialNeeds);
        suggestedActions = ["Find mentors", "Schedule session", "Browse expertise"];
        break;

      case "event":
        content = await this.generateEventResponse(socialNeeds);
        suggestedActions = ["View events", "RSVP to event", "Create event"];
        break;

      case "relationship":
        content = await this.generateRelationshipResponse(socialNeeds);
        suggestedActions = ["Connect with people", "Join discussions", "Share interests"];
        break;

      case "skills":
        content = await this.generateSkillsResponse(socialNeeds);
        suggestedActions = ["Take social skills course", "Practice conversations", "Join skill-building groups"];
        break;

      default:
        content = await this.generateGeneralSocialResponse(socialNeeds);
        suggestedActions = ["Explore communities", "Find mentors", "Join events"];
    }

    // Add emotional support for social anxiety
    if (socialNeeds.urgency === "high") {
      content += " I understand that building connections can feel challenging. Remember, everyone starts somewhere, and there are many supportive communities ready to welcome you. Take it one step at a time.";
    }

    return {
      content,
      confidence: 0.85,
      suggestedActions,
      emotionalSupport: {
        primary: "supportive",
        intensity: 0.7,
        valence: 0.8,
        arousal: 0.4,
        confidence: 0.8,
        timestamp: new Date(),
      },
      metadata: {
        socialNeeds,
        communitiesAvailable: this.communities.size,
        mentorsAvailable: this.mentors.size,
        eventsAvailable: this.events.size,
        agentId: this.id,
      },
    };
  }

  private async generateCommunityResponse(socialNeeds: any): Promise<string> {
    const { interests, urgency } = socialNeeds;

    let content = "I'd love to help you find the perfect community! ";

    if (interests.length > 0) {
      const matchingCommunities = Array.from(this.communities.values())
        .filter(community =>
          interests.some(interest =>
            community.tags.includes(interest) ||
            community.category === interest
          )
        )
        .slice(0, 3);

      if (matchingCommunities.length > 0) {
        content += `Based on your interests in ${interests.join(", ")}, I found some great communities for you: `;
        matchingCommunities.forEach(community => {
          content += `"${community.name}" (${community.memberCount} members, ${community.activityLevel} activity), `;
        });
        content = content.slice(0, -2) + ". ";
      }
    }

    content += `I have ${this.communities.size} communities available across various categories including technology, health, creative arts, and more. `;

    if (urgency === "high") {
      content += "I recommend starting with a smaller, more intimate community where you can feel comfortable and supported. ";
    }

    content += "Would you like me to show you more communities or help you join one?";

    return content;
  }

  private async generateMentorshipResponse(socialNeeds: any): Promise<string> {
    const { interests, urgency } = socialNeeds;

    let content = "Finding the right mentor can be a game-changer for your personal and professional growth! ";

    if (interests.length > 0) {
      const matchingMentors = Array.from(this.mentors.values())
        .filter(mentor =>
          interests.some(interest =>
            mentor.expertise.includes(interest)
          )
        )
        .slice(0, 2);

      if (matchingMentors.length > 0) {
        content += "I found some excellent mentors in your areas of interest: ";
        matchingMentors.forEach(mentor => {
          content += `${mentor.name} (${mentor.expertise.join(", ")}, ${mentor.experience} years experience, ${mentor.rating}/5 rating), `;
        });
        content = content.slice(0, -2) + ". ";
      }
    }

    content += `I have ${this.mentors.size} mentors available across various fields. `;

    if (urgency === "high") {
      content += "I can help you connect with a mentor right away to get the support you need. ";
    }

    content += "Would you like to see more mentor profiles or schedule a session?";

    return content;
  }

  private async generateEventResponse(socialNeeds: any): Promise<string> {
    const { interests } = socialNeeds;

    let content = "Great! Events are a fantastic way to meet new people and learn new things. ";

    const upcomingEvents = Array.from(this.events.values())
      .filter(event => event.date > new Date())
      .slice(0, 3);

    if (upcomingEvents.length > 0) {
      content += "Here are some upcoming events you might enjoy: ";
      upcomingEvents.forEach(event => {
        const daysUntil = Math.ceil((event.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        content += `"${event.title}" (${daysUntil} days away, ${event.attendees}/${event.maxAttendees} spots filled), `;
      });
      content = content.slice(0, -2) + ". ";
    }

    content += `I have ${this.events.size} events available, including both online and in-person options. `;
    content += "Would you like to see more events or RSVP to one of these?";

    return content;
  }

  private async generateRelationshipResponse(socialNeeds: any): Promise<string> {
    const { urgency } = socialNeeds;

    let content = "Building meaningful relationships is one of the most important aspects of a fulfilling life. ";

    if (urgency === "high") {
      content += "I understand you're feeling a strong need for connection right now. ";
      content += "Let me help you find supportive communities and people who share your interests. ";
    }

    content += "I can help you: ";
    content += "• Connect with people who share your interests ";
    content += "• Join supportive communities ";
    content += "• Develop your social skills ";
    content += "• Find local or online groups ";
    content += "• Build confidence in social situations ";

    content += "What type of connection are you looking for? Friends, professional networking, or something else?";

    return content;
  }

  private async generateSkillsResponse(socialNeeds: any): Promise<string> {
    let content = "Developing social skills is a journey that everyone can benefit from! ";

    content += "I can help you improve your social skills through: ";
    content += "• Practice conversations with AI ";
    content += "• Join skill-building communities ";
    content += "• Attend social skills workshops ";
    content += "• Get feedback on your interactions ";
    content += "• Learn from experienced mentors ";

    content += "Social skills are like any other skill - they improve with practice and patience. ";
    content += "Would you like to start with some conversation practice or join a social skills group?";

    return content;
  }

  private async generateGeneralSocialResponse(socialNeeds: any): Promise<string> {
    let content = "I'm here to help you build meaningful connections and find your community! ";

    content += "I can assist you with: ";
    content += "• Finding communities that match your interests ";
    content += "• Connecting with mentors and experts ";
    content += "• Discovering events and meetups ";
    content += "• Building relationships and friendships ";
    content += "• Developing your social skills ";

    content += "What aspect of social connection would you like to explore today?";

    return content;
  }

  async getCommunities(category?: string): Promise<Community[]> {
    const communities = Array.from(this.communities.values());
    return category ? communities.filter(c => c.category === category) : communities;
  }

  async getMentors(expertise?: string): Promise<Mentor[]> {
    const mentors = Array.from(this.mentors.values());
    return expertise ? mentors.filter(m => m.expertise.includes(expertise)) : mentors;
  }

  async getEvents(upcoming?: boolean): Promise<SocialEvent[]> {
    const events = Array.from(this.events.values());
    if (upcoming) {
      return events.filter(e => e.date > new Date());
    }
    return events;
  }

  async joinCommunity(userId: string, communityId: string): Promise<boolean> {
    const community = this.communities.get(communityId);
    if (community) {
      // In a real implementation, this would update the database
      console.log(`User ${userId} joined community ${communityId}`);
      return true;
    }
    return false;
  }

  async connectWithMentor(userId: string, mentorId: string): Promise<boolean> {
    const mentor = this.mentors.get(mentorId);
    if (mentor && mentor.availability === "available") {
      // In a real implementation, this would schedule a session
      console.log(`User ${userId} connected with mentor ${mentorId}`);
      return true;
    }
    return false;
  }

  async rsvpToEvent(userId: string, eventId: string): Promise<boolean> {
    const event = this.events.get(eventId);
    if (event && event.attendees < event.maxAttendees) {
      // In a real implementation, this would update the event
      console.log(`User ${userId} RSVP'd to event ${eventId}`);
      return true;
    }
    return false;
  }
}
