export interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  gradeLevel?: "kindergarten" | "elementary" | "middle" | "high" | "college" | "graduate";
  modules: Module[];
  prerequisites: string[];
  estimatedDuration: number; // in hours
  difficulty: number; // 1-10
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  assessments: Assessment[];
  order: number;
  estimatedDuration: number; // in minutes
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: "lecture" | "interactive" | "hands-on" | "discussion" | "quiz";
  materials: LearningMaterial[];
  objectives: string[];
  duration: number; // in minutes
  order: number;
}

export interface LearningMaterial {
  id: string;
  type: "text" | "video" | "audio" | "image" | "interactive" | "document" | "simulation";
  title: string;
  content: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface Assessment {
  id: string;
  title: string;
  type: "quiz" | "assignment" | "project" | "exam";
  questions: Question[];
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  order: number;
}

export interface Question {
  id: string;
  type: "multiple-choice" | "true-false" | "short-answer" | "essay" | "matching" | "fill-blank";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface StudentProgress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  completedAssessments: string[];
  currentModule: string;
  currentLesson: string;
  overallProgress: number; // 0-100
  grades: Record<string, number>; // assessmentId -> score
  timeSpent: number; // in minutes
  lastAccessed: Date;
}

export interface LearningAnalytics {
  userId: string;
  courseId: string;
  lessonEngagement: Record<string, number>; // lessonId -> engagement score
  assessmentPerformance: Record<string, number>; // assessmentId -> performance
  learningPath: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export class LMSSystem {
  private courses: Map<string, Course> = new Map();
  private studentProgress: Map<string, StudentProgress> = new Map();
  private analytics: Map<string, LearningAnalytics> = new Map();

  constructor() {
    this.initializeDefaultCourses();
  }

  private initializeDefaultCourses(): void {
    // Add some default courses
    const courses: Course[] = [
      this.createMathCourse(),
      this.createScienceCourse(),
      this.createLanguageCourse(),
      this.createProgrammingCourse(),
      this.createPhilosophyCourse(),
    ];

    courses.forEach(course => {
      this.courses.set(course.id, course);
    });
  }

  private createMathCourse(): Course {
    return {
      id: "math-fundamentals",
      title: "Mathematics Fundamentals",
      description: "A comprehensive introduction to mathematical concepts from basic arithmetic to advanced algebra.",
      subject: "Mathematics",
      level: "beginner",
      gradeLevel: "elementary",
      modules: [
        {
          id: "basic-arithmetic",
          title: "Basic Arithmetic",
          description: "Learn addition, subtraction, multiplication, and division.",
          lessons: [
            {
              id: "addition-basics",
              title: "Addition Basics",
              content: "Addition is the process of combining numbers to find their sum...",
              type: "lecture",
              materials: [
                {
                  id: "add-video",
                  type: "video",
                  title: "Addition Explained",
                  content: "A visual explanation of addition concepts",
                  url: "/videos/addition-basics.mp4",
                },
              ],
              objectives: ["Understand the concept of addition", "Perform basic addition operations"],
              duration: 30,
              order: 1,
            },
          ],
          assessments: [
            {
              id: "arithmetic-quiz",
              title: "Arithmetic Quiz",
              type: "quiz",
              questions: [
                {
                  id: "add-question",
                  type: "multiple-choice",
                  question: "What is 5 + 7?",
                  options: ["10", "11", "12", "13"],
                  correctAnswer: "12",
                  explanation: "5 + 7 = 12",
                  points: 10,
                },
              ],
              timeLimit: 15,
              passingScore: 70,
              order: 1,
            },
          ],
          order: 1,
          estimatedDuration: 120,
        },
      ],
      prerequisites: [],
      estimatedDuration: 40,
      difficulty: 3,
      tags: ["math", "arithmetic", "elementary"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private createScienceCourse(): Course {
    return {
      id: "science-exploration",
      title: "Science Exploration",
      description: "Discover the wonders of science through hands-on experiments and interactive learning.",
      subject: "Science",
      level: "beginner",
      gradeLevel: "elementary",
      modules: [
        {
          id: "scientific-method",
          title: "The Scientific Method",
          description: "Learn how scientists investigate the world around us.",
          lessons: [
            {
              id: "observation-skills",
              title: "Observation Skills",
              content: "Observation is the foundation of scientific inquiry...",
              type: "interactive",
              materials: [
                {
                  id: "observation-sim",
                  type: "simulation",
                  title: "Observation Simulation",
                  content: "Practice your observation skills with this interactive simulation",
                  url: "/simulations/observation-lab",
                },
              ],
              objectives: ["Develop keen observation skills", "Learn to record observations accurately"],
              duration: 45,
              order: 1,
            },
          ],
          assessments: [],
          order: 1,
          estimatedDuration: 90,
        },
      ],
      prerequisites: [],
      estimatedDuration: 30,
      difficulty: 2,
      tags: ["science", "experiments", "elementary"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private createLanguageCourse(): Course {
    return {
      id: "english-grammar",
      title: "English Grammar Mastery",
      description: "Master English grammar through comprehensive lessons and practice exercises.",
      subject: "Language Arts",
      level: "intermediate",
      gradeLevel: "middle",
      modules: [
        {
          id: "parts-of-speech",
          title: "Parts of Speech",
          description: "Learn about nouns, verbs, adjectives, and other parts of speech.",
          lessons: [
            {
              id: "nouns-lesson",
              title: "Understanding Nouns",
              content: "Nouns are words that name people, places, things, or ideas...",
              type: "lecture",
              materials: [],
              objectives: ["Identify different types of nouns", "Use nouns correctly in sentences"],
              duration: 40,
              order: 1,
            },
          ],
          assessments: [],
          order: 1,
          estimatedDuration: 180,
        },
      ],
      prerequisites: ["basic-reading"],
      estimatedDuration: 50,
      difficulty: 4,
      tags: ["english", "grammar", "language"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private createProgrammingCourse(): Course {
    return {
      id: "python-basics",
      title: "Python Programming Basics",
      description: "Learn to program with Python through hands-on coding exercises.",
      subject: "Computer Science",
      level: "beginner",
      gradeLevel: "high",
      modules: [
        {
          id: "python-intro",
          title: "Introduction to Python",
          description: "Get started with Python programming language.",
          lessons: [
            {
              id: "first-program",
              title: "Your First Python Program",
              content: "Learn to write and run your first Python program...",
              type: "hands-on",
              materials: [
                {
                  id: "python-editor",
                  type: "interactive",
                  title: "Python Code Editor",
                  content: "Practice coding in this interactive Python editor",
                  url: "/tools/python-editor",
                },
              ],
              objectives: ["Write a simple Python program", "Understand basic syntax"],
              duration: 60,
              order: 1,
            },
          ],
          assessments: [],
          order: 1,
          estimatedDuration: 240,
        },
      ],
      prerequisites: ["basic-computer-skills"],
      estimatedDuration: 80,
      difficulty: 5,
      tags: ["programming", "python", "coding"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private createPhilosophyCourse(): Course {
    return {
      id: "philosophy-intro",
      title: "Introduction to Philosophy",
      description: "Explore fundamental philosophical questions and thinkers throughout history.",
      subject: "Philosophy",
      level: "advanced",
      gradeLevel: "college",
      modules: [
        {
          id: "ethics",
          title: "Ethics and Moral Philosophy",
          description: "Examine different ethical theories and moral reasoning.",
          lessons: [
            {
              id: "utilitarianism",
              title: "Utilitarianism",
              content: "Utilitarianism is a consequentialist ethical theory...",
              type: "discussion",
              materials: [],
              objectives: ["Understand utilitarian principles", "Apply utilitarian reasoning"],
              duration: 90,
              order: 1,
            },
          ],
          assessments: [],
          order: 1,
          estimatedDuration: 300,
        },
      ],
      prerequisites: ["critical-thinking"],
      estimatedDuration: 120,
      difficulty: 8,
      tags: ["philosophy", "ethics", "critical-thinking"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Public methods
  async getCourses(filters?: {
    subject?: string;
    level?: string;
    gradeLevel?: string;
    tags?: string[];
  }): Promise<Course[]> {
    let courses = Array.from(this.courses.values());

    if (filters) {
      if (filters.subject) {
        courses = courses.filter(c => c.subject.toLowerCase().includes(filters.subject!.toLowerCase()));
      }
      if (filters.level) {
        courses = courses.filter(c => c.level === filters.level);
      }
      if (filters.gradeLevel) {
        courses = courses.filter(c => c.gradeLevel === filters.gradeLevel);
      }
      if (filters.tags) {
        courses = courses.filter(c => filters.tags!.some(tag => c.tags.includes(tag)));
      }
    }

    return courses;
  }

  async getCourse(courseId: string): Promise<Course | null> {
    return this.courses.get(courseId) || null;
  }

  async enrollStudent(userId: string, courseId: string): Promise<StudentProgress> {
    const course = await this.getCourse(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const progress: StudentProgress = {
      userId,
      courseId,
      completedLessons: [],
      completedAssessments: [],
      currentModule: course.modules[0]?.id || "",
      currentLesson: course.modules[0]?.lessons[0]?.id || "",
      overallProgress: 0,
      grades: {},
      timeSpent: 0,
      lastAccessed: new Date(),
    };

    this.studentProgress.set(`${userId}-${courseId}`, progress);
    return progress;
  }

  async getStudentProgress(userId: string, courseId: string): Promise<StudentProgress | null> {
    return this.studentProgress.get(`${userId}-${courseId}`) || null;
  }

  async updateProgress(userId: string, courseId: string, updates: Partial<StudentProgress>): Promise<StudentProgress> {
    const progress = await this.getStudentProgress(userId, courseId);
    if (!progress) {
      throw new Error("Student not enrolled in this course");
    }

    const updatedProgress = { ...progress, ...updates, lastAccessed: new Date() };
    this.studentProgress.set(`${userId}-${courseId}`, updatedProgress);
    return updatedProgress;
  }

  async completeLesson(userId: string, courseId: string, lessonId: string): Promise<void> {
    const progress = await this.getStudentProgress(userId, courseId);
    if (!progress) {
      throw new Error("Student not enrolled in this course");
    }

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      await this.updateProgress(userId, courseId, progress);
    }
  }

  async submitAssessment(userId: string, courseId: string, assessmentId: string, answers: Record<string, any>): Promise<{ score: number; feedback: string[] }> {
    const course = await this.getCourse(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const assessment = course.modules
      .flatMap(m => m.assessments)
      .find(a => a.id === assessmentId);

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    let totalScore = 0;
    let maxScore = 0;
    const feedback: string[] = [];

    for (const question of assessment.questions) {
      maxScore += question.points;
      const userAnswer = answers[question.id];

      if (this.isAnswerCorrect(question, userAnswer)) {
        totalScore += question.points;
      } else {
        feedback.push(`Question "${question.question}": ${question.explanation || "Incorrect answer"}`);
      }
    }

    const percentageScore = (totalScore / maxScore) * 100;

    // Update progress
    const progress = await this.getStudentProgress(userId, courseId);
    if (progress) {
      progress.grades[assessmentId] = percentageScore;
      if (percentageScore >= assessment.passingScore) {
        progress.completedAssessments.push(assessmentId);
      }
      await this.updateProgress(userId, courseId, progress);
    }

    return {
      score: percentageScore,
      feedback,
    };
  }

  private isAnswerCorrect(question: Question, userAnswer: any): boolean {
    if (Array.isArray(question.correctAnswer)) {
      return Array.isArray(userAnswer) &&
        userAnswer.length === question.correctAnswer.length &&
        userAnswer.every((ans, index) => ans === question.correctAnswer[index]);
    }
    return userAnswer === question.correctAnswer;
  }

  async generatePersonalizedRecommendations(userId: string): Promise<{
    courses: Course[];
    reasons: string[];
  }> {
    const userProgress = Array.from(this.studentProgress.values())
      .filter(p => p.userId === userId);

    const completedCourses = userProgress
      .filter(p => p.overallProgress >= 80)
      .map(p => p.courseId);

    const userStrengths = this.analyzeStrengths(userProgress);
    const recommendations: Course[] = [];
    const reasons: string[] = [];

    // Recommend courses based on completed courses
    for (const courseId of completedCourses) {
      const course = await this.getCourse(courseId);
      if (course) {
        const nextLevelCourses = Array.from(this.courses.values())
          .filter(c => c.subject === course.subject &&
                      this.getLevelNumber(c.level) > this.getLevelNumber(course.level));

        recommendations.push(...nextLevelCourses.slice(0, 2));
        reasons.push(`Based on your success in ${course.title}, you might enjoy these advanced courses.`);
      }
    }

    // Recommend courses based on strengths
    for (const strength of userStrengths) {
      const strengthCourses = Array.from(this.courses.values())
        .filter(c => c.tags.includes(strength) || c.subject.toLowerCase().includes(strength));

      recommendations.push(...strengthCourses.slice(0, 2));
      reasons.push(`You excel in ${strength}-related topics. Here are some courses to further develop this skill.`);
    }

    // Remove duplicates and limit results
    const uniqueRecommendations = recommendations
      .filter((course, index, self) => self.findIndex(c => c.id === course.id) === index)
      .slice(0, 5);

    return {
      courses: uniqueRecommendations,
      reasons: reasons.slice(0, 3),
    };
  }

  private analyzeStrengths(progress: StudentProgress[]): string[] {
    const strengths: string[] = [];

    // Analyze high-performing subjects
    const subjectPerformance = new Map<string, number[]>();

    for (const p of progress) {
      const course = this.courses.get(p.courseId);
      if (course) {
        const scores = Object.values(p.grades);
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

        if (!subjectPerformance.has(course.subject)) {
          subjectPerformance.set(course.subject, []);
        }
        subjectPerformance.get(course.subject)!.push(avgScore);
      }
    }

    for (const [subject, scores] of subjectPerformance) {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avgScore >= 85) {
        strengths.push(subject.toLowerCase());
      }
    }

    return strengths;
  }

  private getLevelNumber(level: string): number {
    const levelMap: Record<string, number> = {
      "beginner": 1,
      "intermediate": 2,
      "advanced": 3,
      "expert": 4,
    };
    return levelMap[level] || 1;
  }

  async createCustomCourse(template: Partial<Course>): Promise<Course> {
    const course: Course = {
      id: `custom-${Date.now()}`,
      title: template.title || "Custom Course",
      description: template.description || "A custom learning experience",
      subject: template.subject || "General",
      level: template.level || "beginner",
      gradeLevel: template.gradeLevel,
      modules: template.modules || [],
      prerequisites: template.prerequisites || [],
      estimatedDuration: template.estimatedDuration || 10,
      difficulty: template.difficulty || 5,
      tags: template.tags || ["custom"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.courses.set(course.id, course);
    return course;
  }
}
