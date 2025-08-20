import { Agent, AgentResponse } from "../core/agent";
import { UserContext, EmotionalState } from "../core/master-conductor";

export interface CreativeProject {
  id: string;
  title: string;
  description: string;
  type: "writing" | "art" | "music" | "photography" | "video" | "craft" | "design" | "poetry";
  status: "planning" | "in-progress" | "completed" | "paused";
  startDate: Date;
  lastModified: Date;
  tags: string[];
  inspiration: string[];
  progress: number; // percentage
}

export interface CreativePrompt {
  id: string;
  title: string;
  description: string;
  category: CreativeProject["type"];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number; // in minutes
  materials?: string[];
  inspiration?: string;
}

export interface CreativeSkill {
  id: string;
  name: string;
  category: CreativeProject["type"];
  level: "beginner" | "intermediate" | "advanced" | "expert";
  experience: number; // in hours
  confidence: number; // 0-100
  lastPracticed?: Date;
}

export interface CreativeInspiration {
  id: string;
  title: string;
  description: string;
  type: "quote" | "image" | "music" | "poem" | "story" | "technique";
  source: string;
  category: CreativeProject["type"];
  tags: string[];
}

export class CreativeExpressionAgent extends Agent {
  private projects: Map<string, CreativeProject> = new Map();
  private prompts: Map<string, CreativePrompt> = new Map();
  private skills: Map<string, CreativeSkill> = new Map();
  private inspirations: Map<string, CreativeInspiration> = new Map();
  private userPreferences: Map<string, any> = new Map();

  constructor() {
    super(
      "creative-expression",
      "Creative Expression Agent",
      "Helps users explore and develop their creative talents and artistic expression",
      [
        "creative projects",
        "artistic inspiration",
        "skill development",
        "creative prompts",
        "artistic techniques",
        "creative collaboration",
        "portfolio building",
      ]
    );

    this.initializeCreativeResources();
  }

  private initializeCreativeResources(): void {
    // Initialize sample creative projects
    this.projects.set("novel-project", {
      id: "novel-project",
      title: "The Lost Garden",
      description: "A fantasy novel about a magical garden that appears only to those who need it most",
      type: "writing",
      status: "in-progress",
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      lastModified: new Date(),
      tags: ["fantasy", "magical realism", "healing"],
      inspiration: ["nature", "personal growth", "magic"],
      progress: 45,
    });

    this.projects.set("watercolor-series", {
      id: "watercolor-series",
      title: "Urban Landscapes",
      description: "A series of watercolor paintings capturing the beauty of city life",
      type: "art",
      status: "planning",
      startDate: new Date(),
      lastModified: new Date(),
      tags: ["watercolor", "urban", "landscape"],
      inspiration: ["city life", "architecture", "color"],
      progress: 10,
    });

    // Initialize sample creative prompts
    this.prompts.set("write-memory", {
      id: "write-memory",
      title: "Write About a Childhood Memory",
      description: "Describe a vivid childhood memory in detail, focusing on sensory details and emotions",
      category: "writing",
      difficulty: "beginner",
      estimatedTime: 30,
      inspiration: "Think about a moment that shaped who you are today",
    });

    this.prompts.set("abstract-emotion", {
      id: "abstract-emotion",
      title: "Paint an Emotion",
      description: "Create an abstract painting that represents a specific emotion using color and form",
      category: "art",
      difficulty: "intermediate",
      estimatedTime: 60,
      materials: ["canvas", "acrylic paints", "brushes"],
      inspiration: "How does joy, sadness, or anger look to you?",
    });

    this.prompts.set("found-poetry", {
      id: "found-poetry",
      title: "Found Poetry",
      description: "Create a poem using words and phrases from newspapers, magazines, or books",
      category: "poetry",
      difficulty: "beginner",
      estimatedTime: 45,
      materials: ["magazines", "scissors", "glue", "paper"],
      inspiration: "Look for words that speak to you and arrange them into meaning",
    });

    // Initialize sample creative skills
    this.skills.set("creative-writing", {
      id: "creative-writing",
      name: "Creative Writing",
      category: "writing",
      level: "intermediate",
      experience: 120,
      confidence: 75,
      lastPracticed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    });

    this.skills.set("watercolor-painting", {
      id: "watercolor-painting",
      name: "Watercolor Painting",
      category: "art",
      level: "beginner",
      experience: 40,
      confidence: 60,
      lastPracticed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    });

    // Initialize sample inspirations
    this.inspirations.set("nature-quote", {
      id: "nature-quote",
      title: "Nature's Wisdom",
      description: "\"In every walk with nature, one receives far more than he seeks.\" - John Muir",
      type: "quote",
      source: "John Muir",
      category: "writing",
      tags: ["nature", "wisdom", "inspiration"],
    });

    this.inspirations.set("color-theory", {
      id: "color-theory",
      title: "Color Psychology",
      description: "Understanding how different colors evoke emotions and create mood in art",
      type: "technique",
      source: "Art Fundamentals",
      category: "art",
      tags: ["color", "psychology", "technique"],
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
      // Analyze creative expression needs
      const creativeNeeds = this.analyzeCreativeNeeds(input, emotionalState);

      // Generate appropriate response
      const response = await this.generateCreativeResponse(input, creativeNeeds, context);

      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(processingTime, response.confidence);

      return response;
    } catch (error) {
      console.error("Creative Expression Agent processing error:", error);
      this.status.errorCount++;

      return {
        content: "I'm here to help you explore your creative side and develop your artistic expression. I'm experiencing some technical difficulties right now, but I can still assist you with your creative needs.",
        confidence: 0.5,
        suggestedActions: ["Start project", "Get inspiration", "Practice skills"],
        emotionalSupport: emotionalState,
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          agentId: this.id,
        },
      };
    }
  }

  private analyzeCreativeNeeds(input: string, emotionalState: EmotionalState): {
    type: "project" | "inspiration" | "skill" | "prompt" | "technique" | "collaboration";
    mood: "exploratory" | "focused" | "playful" | "serious";
    mediums: CreativeProject["type"][];
  } {
    const inputLower = input.toLowerCase();

    let type: "project" | "inspiration" | "skill" | "prompt" | "technique" | "collaboration" = "project";
    let mood: "exploratory" | "focused" | "playful" | "serious" = "exploratory";
    const mediums: CreativeProject["type"][] = [];

    // Determine type of creative need
    if (inputLower.includes("project") || inputLower.includes("work") || inputLower.includes("create")) {
      type = "project";
    } else if (inputLower.includes("inspire") || inputLower.includes("idea") || inputLower.includes("motivation")) {
      type = "inspiration";
    } else if (inputLower.includes("skill") || inputLower.includes("learn") || inputLower.includes("practice")) {
      type = "skill";
    } else if (inputLower.includes("prompt") || inputLower.includes("exercise") || inputLower.includes("challenge")) {
      type = "prompt";
    } else if (inputLower.includes("technique") || inputLower.includes("method") || inputLower.includes("style")) {
      type = "technique";
    } else if (inputLower.includes("collaborate") || inputLower.includes("share") || inputLower.includes("community")) {
      type = "collaboration";
    }

    // Determine creative mood
    if (inputLower.includes("play") || inputLower.includes("fun") || inputLower.includes("experiment")) {
      mood = "playful";
    } else if (inputLower.includes("focus") || inputLower.includes("serious") || inputLower.includes("professional")) {
      mood = "focused";
    } else if (inputLower.includes("explore") || inputLower.includes("discover") || inputLower.includes("try")) {
      mood = "exploratory";
    } else if (inputLower.includes("deep") || inputLower.includes("meaningful") || inputLower.includes("profound")) {
      mood = "serious";
    }

    // Extract creative mediums
    const mediumKeywords = [
      { keyword: "write", medium: "writing" },
      { keyword: "paint", medium: "art" },
      { keyword: "music", medium: "music" },
      { keyword: "photo", medium: "photography" },
      { keyword: "video", medium: "video" },
      { keyword: "craft", medium: "craft" },
      { keyword: "design", medium: "design" },
      { keyword: "poem", medium: "poetry" },
    ];

    mediumKeywords.forEach(({ keyword, medium }) => {
      if (inputLower.includes(keyword)) {
        mediums.push(medium as CreativeProject["type"]);
      }
    });

    return { type, mood, mediums };
  }

  private async generateCreativeResponse(
    input: string,
    creativeNeeds: any,
    context: UserContext
  ): Promise<AgentResponse> {
    let content = "";
    let suggestedActions: string[] = [];

    switch (creativeNeeds.type) {
      case "project":
        content = await this.generateProjectResponse(creativeNeeds);
        suggestedActions = ["Start project", "Continue project", "Share project"];
        break;

      case "inspiration":
        content = await this.generateInspirationResponse(creativeNeeds);
        suggestedActions = ["Get inspiration", "Save inspiration", "Explore more"];
        break;

      case "skill":
        content = await this.generateSkillResponse(creativeNeeds);
        suggestedActions = ["Practice skill", "Learn technique", "Track progress"];
        break;

      case "prompt":
        content = await this.generatePromptResponse(creativeNeeds);
        suggestedActions = ["Try prompt", "Save prompt", "Get more prompts"];
        break;

      case "technique":
        content = await this.generateTechniqueResponse(creativeNeeds);
        suggestedActions = ["Learn technique", "Practice technique", "Master skill"];
        break;

      case "collaboration":
        content = await this.generateCollaborationResponse(creativeNeeds);
        suggestedActions = ["Find collaborators", "Share work", "Join community"];
        break;

      default:
        content = await this.generateGeneralCreativeResponse(creativeNeeds);
        suggestedActions = ["Start creating", "Get inspired", "Explore mediums"];
    }

    // Add creative encouragement based on mood
    if (creativeNeeds.mood === "playful") {
      content += " Remember, creativity is about having fun and exploring without judgment. Let your imagination run wild!";
    } else if (creativeNeeds.mood === "serious") {
      content += " Your creative voice is unique and valuable. Trust your instincts and let your authentic self shine through.";
    }

    return {
      content,
      confidence: 0.85,
      suggestedActions,
      emotionalSupport: {
        primary: "encouraging",
        intensity: 0.7,
        valence: 0.8,
        arousal: 0.6,
        confidence: 0.8,
        timestamp: new Date(),
      },
      metadata: {
        creativeNeeds,
        projectsCount: this.projects.size,
        promptsCount: this.prompts.size,
        skillsCount: this.skills.size,
        inspirationsCount: this.inspirations.size,
        agentId: this.id,
      },
    };
  }

  private async generateProjectResponse(creativeNeeds: any): Promise<string> {
    const { mood, mediums } = creativeNeeds;

    let content = "Let's bring your creative vision to life! ";

    const activeProjects = Array.from(this.projects.values())
      .filter(project => project.status === "in-progress")
      .slice(0, 2);

    if (activeProjects.length > 0) {
      content += "Your active projects: ";
      activeProjects.forEach(project => {
        const progressEmoji = project.progress >= 80 ? "🎉" : project.progress >= 50 ? "📈" : "🔄";
        content += `${progressEmoji} "${project.title}" (${project.progress}% complete), `;
      });
      content = content.slice(0, -2) + ". ";
    }

    if (mediums.length > 0) {
      content += `I can help you with ${mediums.join(", ")} projects. `;
    }

    if (mood === "playful") {
      content += "Let's have fun and experiment with new ideas! ";
    } else if (mood === "focused") {
      content += "Let's work on something meaningful and develop your skills. ";
    }

    content += "Would you like to start a new project, continue an existing one, or get some project ideas?";

    return content;
  }

  private async generateInspirationResponse(creativeNeeds: any): Promise<string> {
    const { mood, mediums } = creativeNeeds;

    let content = "Inspiration is everywhere - let's find what speaks to your creative soul! ";

    const relevantInspirations = Array.from(this.inspirations.values())
      .filter(inspiration =>
        mediums.length === 0 || mediums.includes(inspiration.category)
      )
      .slice(0, 2);

    if (relevantInspirations.length > 0) {
      content += "Here's some inspiration for you: ";
      relevantInspirations.forEach(inspiration => {
        content += `"${inspiration.title}" - ${inspiration.description}, `;
      });
      content = content.slice(0, -2) + ". ";
    }

    content += "I can help you find inspiration from quotes, techniques, nature, emotions, or other artists. ";

    if (mood === "exploratory") {
      content += "Let's discover something new and unexpected! ";
    }

    content += "What type of inspiration are you looking for today?";

    return content;
  }

  private async generateSkillResponse(creativeNeeds: any): Promise<string> {
    const { mediums } = creativeNeeds;

    let content = "Developing your creative skills is a journey of growth and discovery! ";

    const userSkills = Array.from(this.skills.values())
      .filter(skill =>
        mediums.length === 0 || mediums.includes(skill.category)
      )
      .slice(0, 3);

    if (userSkills.length > 0) {
      content += "Your current skills: ";
      userSkills.forEach(skill => {
        const levelEmoji = skill.level === "expert" ? "🏆" : skill.level === "advanced" ? "⭐" : skill.level === "intermediate" ? "📚" : "🌱";
        content += `${levelEmoji} ${skill.name} (${skill.level}, ${skill.confidence}% confidence), `;
      });
      content = content.slice(0, -2) + ". ";
    }

    content += "I can help you practice existing skills, learn new techniques, or track your progress. ";
    content += "What skill would you like to work on today?";

    return content;
  }

  private async generatePromptResponse(creativeNeeds: any): Promise<string> {
    const { mood, mediums } = creativeNeeds;

    let content = "Creative prompts are perfect for sparking new ideas and building your skills! ";

    const relevantPrompts = Array.from(this.prompts.values())
      .filter(prompt =>
        mediums.length === 0 || mediums.includes(prompt.category)
      )
      .slice(0, 2);

    if (relevantPrompts.length > 0) {
      content += "Here are some prompts for you: ";
      relevantPrompts.forEach(prompt => {
        const difficultyEmoji = prompt.difficulty === "advanced" ? "🔥" : prompt.difficulty === "intermediate" ? "📝" : "✨";
        content += `${difficultyEmoji} "${prompt.title}" (${prompt.estimatedTime} min, ${prompt.difficulty}), `;
      });
      content = content.slice(0, -2) + ". ";
    }

    if (mood === "playful") {
      content += "Let's try something fun and experimental! ";
    }

    content += "I have prompts for all skill levels and creative mediums. ";
    content += "What type of prompt interests you today?";

    return content;
  }

  private async generateTechniqueResponse(creativeNeeds: any): Promise<string> {
    let content = "Mastering creative techniques opens up new possibilities for expression! ";

    content += "I can help you learn techniques for: ";
    content += "• Writing: narrative structure, character development, dialogue ";
    content += "• Art: color theory, composition, different mediums ";
    content += "• Music: rhythm, melody, harmony ";
    content += "• Photography: lighting, composition, editing ";
    content += "• And many more creative disciplines ";

    content += "Techniques are tools that help you express your unique vision. ";
    content += "What technique would you like to explore or improve?";

    return content;
  }

  private async generateCollaborationResponse(creativeNeeds: any): Promise<string> {
    let content = "Collaboration can spark amazing creative energy and new perspectives! ";

    content += "I can help you: ";
    content += "• Find creative collaborators ";
    content += "• Share your work with communities ";
    content += "• Get feedback on your projects ";
    content += "• Join creative challenges ";
    content += "• Participate in collaborative projects ";

    content += "Creativity thrives in community and shared inspiration. ";
    content += "What type of collaboration interests you?";

    return content;
  }

  private async generateGeneralCreativeResponse(creativeNeeds: any): Promise<string> {
    let content = "Welcome to your creative sanctuary! I'm here to support your artistic journey. ";

    content += "I can help you with: ";
    content += "• Starting and managing creative projects ";
    content += "• Finding inspiration and motivation ";
    content += "• Developing your creative skills ";
    content += "• Exploring new techniques and mediums ";
    content += "• Connecting with other creators ";
    content += "• Building your creative confidence ";

    content += "Every creative journey is unique. Let's discover what speaks to your soul today! ";
    content += "What would you like to explore?";

    return content;
  }

  async getProjects(status?: CreativeProject["status"], type?: CreativeProject["type"]): Promise<CreativeProject[]> {
    const projects = Array.from(this.projects.values());
    let filtered = projects;

    if (status) {
      filtered = filtered.filter(project => project.status === status);
    }

    if (type) {
      filtered = filtered.filter(project => project.type === type);
    }

    return filtered.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  }

  async getPrompts(category?: CreativePrompt["category"], difficulty?: CreativePrompt["difficulty"]): Promise<CreativePrompt[]> {
    const prompts = Array.from(this.prompts.values());
    let filtered = prompts;

    if (category) {
      filtered = filtered.filter(prompt => prompt.category === category);
    }

    if (difficulty) {
      filtered = filtered.filter(prompt => prompt.difficulty === difficulty);
    }

    return filtered;
  }

  async getSkills(category?: CreativeSkill["category"]): Promise<CreativeSkill[]> {
    const skills = Array.from(this.skills.values());
    return category ? skills.filter(skill => skill.category === category) : skills;
  }

  async getInspirations(category?: CreativeInspiration["category"], type?: CreativeInspiration["type"]): Promise<CreativeInspiration[]> {
    const inspirations = Array.from(this.inspirations.values());
    let filtered = inspirations;

    if (category) {
      filtered = filtered.filter(inspiration => inspiration.category === category);
    }

    if (type) {
      filtered = filtered.filter(inspiration => inspiration.type === type);
    }

    return filtered;
  }

  async createProject(projectData: Omit<CreativeProject, "id" | "startDate" | "lastModified">): Promise<CreativeProject> {
    const id = `project-${Date.now()}`;
    const now = new Date();
    const project: CreativeProject = {
      ...projectData,
      id,
      startDate: now,
      lastModified: now,
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProjectProgress(projectId: string, progress: number): Promise<boolean> {
    const project = this.projects.get(projectId);
    if (project) {
      project.progress = Math.min(100, Math.max(0, progress));
      project.lastModified = new Date();
      return true;
    }
    return false;
  }

  async practiceSkill(skillId: string, hours: number): Promise<boolean> {
    const skill = this.skills.get(skillId);
    if (skill) {
      skill.experience += hours;
      skill.lastPracticed = new Date();

      // Update level based on experience
      if (skill.experience >= 500) {
skill.level = "expert";
} else if (skill.experience >= 200) {
skill.level = "advanced";
} else if (skill.experience >= 50) {
skill.level = "intermediate";
}

      return true;
    }
    return false;
  }

  async addInspiration(inspirationData: Omit<CreativeInspiration, "id">): Promise<CreativeInspiration> {
    const id = `inspiration-${Date.now()}`;
    const inspiration: CreativeInspiration = { ...inspirationData, id };
    this.inspirations.set(id, inspiration);
    return inspiration;
  }
}
