import { promises as fs } from 'fs';
import path from 'path';

// Data interfaces
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  isAI: boolean;
  timestamp: string;
}

export interface Song {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  composition: any;
  createdAt: string;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  event: string;
  data: any;
  timestamp: string;
}

class FileDatabase {
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
  }

  private async ensureDataDir(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
  }

  private async readFile<T>(filename: string): Promise<T[]> {
    await this.ensureDataDir();
    const filePath = path.join(this.dataDir, filename);
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is empty, return empty array
      return [];
    }
  }

  private async writeFile<T>(filename: string, data: T[]): Promise<void> {
    await this.ensureDataDir();
    const filePath = path.join(this.dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  // User operations
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const users = await this.readFile<User>('users.json');
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    await this.writeFile('users.json', users);
    return newUser;
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.readFile<User>('users.json');
    return users.find(user => user.id === id) || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const users = await this.readFile<User>('users.json');
    return users.find(user => user.username === username) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.readFile<User>('users.json');
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    await this.writeFile('users.json', users);
    return users[index];
  }

  // Session operations
  async createSession(session: Omit<Session, 'id' | 'createdAt'>): Promise<Session> {
    const sessions = await this.readFile<Session>('sessions.json');
    const newSession: Session = {
      ...session,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    sessions.push(newSession);
    await this.writeFile('sessions.json', sessions);
    return newSession;
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    const sessions = await this.readFile<Session>('sessions.json');
    const session = sessions.find(s => s.token === token);
    if (!session) return null;
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      await this.deleteSession(session.id);
      return null;
    }
    
    return session;
  }

  async deleteSession(id: string): Promise<void> {
    const sessions = await this.readFile<Session>('sessions.json');
    const filtered = sessions.filter(s => s.id !== id);
    await this.writeFile('sessions.json', filtered);
  }

  // Post operations
  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const posts = await this.readFile<Post>('posts.json');
    const newPost: Post = {
      ...post,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    posts.push(newPost);
    await this.writeFile('posts.json', posts);
    return newPost;
  }

  async getPosts(): Promise<Post[]> {
    return await this.readFile<Post>('posts.json');
  }

  async getPostById(id: string): Promise<Post | null> {
    const posts = await this.readFile<Post>('posts.json');
    return posts.find(post => post.id === id) || null;
  }

  // Comment operations
  async createComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    const comments = await this.readFile<Comment>('comments.json');
    const newComment: Comment = {
      ...comment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);
    await this.writeFile('comments.json', comments);
    return newComment;
  }

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const comments = await this.readFile<Comment>('comments.json');
    return comments.filter(comment => comment.postId === postId);
  }

  // Chat operations
  async createChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage> {
    const messages = await this.readFile<ChatMessage>('chat.json');
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    messages.push(newMessage);
    await this.writeFile('chat.json', messages);
    return newMessage;
  }

  async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    const messages = await this.readFile<ChatMessage>('chat.json');
    return messages
      .filter(msg => msg.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Song operations
  async createSong(song: Omit<Song, 'id' | 'createdAt'>): Promise<Song> {
    const songs = await this.readFile<Song>('songs.json');
    const newSong: Song = {
      ...song,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    songs.push(newSong);
    await this.writeFile('songs.json', songs);
    return newSong;
  }

  async getSongsByUserId(userId: string): Promise<Song[]> {
    const songs = await this.readFile<Song>('songs.json');
    return songs.filter(song => song.userId === userId);
  }

  // Knowledge operations
  async createKnowledgeEntry(entry: Omit<KnowledgeEntry, 'id' | 'createdAt'>): Promise<KnowledgeEntry> {
    const entries = await this.readFile<KnowledgeEntry>('knowledge.json');
    const newEntry: KnowledgeEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    entries.push(newEntry);
    await this.writeFile('knowledge.json', entries);
    return newEntry;
  }

  async getKnowledgeEntries(): Promise<KnowledgeEntry[]> {
    return await this.readFile<KnowledgeEntry>('knowledge.json');
  }

  async searchKnowledge(query: string): Promise<KnowledgeEntry[]> {
    const entries = await this.readFile<KnowledgeEntry>('knowledge.json');
    const lowerQuery = query.toLowerCase();
    return entries.filter(entry => 
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.content.toLowerCase().includes(lowerQuery) ||
      entry.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Analytics operations
  async logEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<AnalyticsEvent> {
    const events = await this.readFile<AnalyticsEvent>('analytics.json');
    const newEvent: AnalyticsEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    events.push(newEvent);
    await this.writeFile('analytics.json', events);
    return newEvent;
  }

  async getAnalyticsEvents(userId?: string, limit: number = 100): Promise<AnalyticsEvent[]> {
    const events = await this.readFile<AnalyticsEvent>('analytics.json');
    let filtered = events;
    if (userId) {
      filtered = events.filter(event => event.userId === userId);
    }
    return filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

export const db = new FileDatabase();
