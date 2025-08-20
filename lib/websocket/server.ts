import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { AuthService } from "../auth";
import { db } from "../db/file-db";
import { OllamaClient } from "../ai/ollama-client";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  username?: string;
}

interface ChatMessage {
  type: "message";
  content: string;
  userId: string;
  username: string;
  timestamp: string;
}

interface SystemMessage {
  type: "system";
  content: string;
  timestamp: string;
}

type WSMessage = ChatMessage | SystemMessage;

class WebSocketManager {
  private wss: WebSocketServer;
  private rooms: Map<string, Set<AuthenticatedWebSocket>> = new Map();
  private aiClient: OllamaClient;

  constructor(server: any) {
    this.wss = new WebSocketServer({ noServer: true });
    this.aiClient = new OllamaClient();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.wss.on("connection", (ws: AuthenticatedWebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request);
    });
  }

  private async handleConnection(ws: AuthenticatedWebSocket, request: IncomingMessage) {
    try {
      // Extract token from query parameters
      const url = new URL(request.url!, `http://${request.headers.host}`);
      const token = url.searchParams.get("token");

      if (!token) {
        ws.close(1008, "Authentication required");
        return;
      }

      // Authenticate user
      const user = await AuthService.authenticate(token);
      if (!user) {
        ws.close(1008, "Invalid token");
        return;
      }

      // Store user info in websocket
      ws.userId = user.id;
      ws.username = user.username;

      // Add to default room
      this.joinRoom(ws, "general");

      // Send welcome message
      const welcomeMessage: SystemMessage = {
        type: "system",
        content: `Welcome ${user.username}! You've joined the chat.`,
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(welcomeMessage));

      // Handle incoming messages
      ws.on("message", async(data: Buffer) => {
        try {
          const message: WSMessage = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error("Error handling message:", error);
          const errorMessage: SystemMessage = {
            type: "system",
            content: "Error processing message",
            timestamp: new Date().toISOString(),
          };
          ws.send(JSON.stringify(errorMessage));
        }
      });

      // Handle disconnection
      ws.on("close", () => {
        this.leaveAllRooms(ws);
      });

    } catch (error) {
      console.error("WebSocket connection error:", error);
      ws.close(1011, "Internal server error");
    }
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: WSMessage) {
    if (message.type === "message") {
      // Save user message to database
      await db.createChatMessage({
        userId: ws.userId!,
        content: message.content,
        isAI: false,
      });

      // Broadcast to room
      this.broadcastToRoom("general", {
        type: "message",
        content: message.content,
        userId: ws.userId!,
        username: ws.username!,
        timestamp: new Date().toISOString(),
      });

      // Generate AI response
      try {
        const aiResponse = await this.aiClient.chat(message.content);

        // Save AI response to database
        await db.createChatMessage({
          userId: ws.userId!,
          content: aiResponse,
          isAI: true,
        });

        // Broadcast AI response
        this.broadcastToRoom("general", {
          type: "message",
          content: aiResponse,
          userId: "ai",
          username: "ASHBABY4LIFE AI",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("AI response error:", error);
        const errorMessage: SystemMessage = {
          type: "system",
          content: "Sorry, I encountered an error processing your message.",
          timestamp: new Date().toISOString(),
        };
        ws.send(JSON.stringify(errorMessage));
      }
    }
  }

  private joinRoom(ws: AuthenticatedWebSocket, roomName: string) {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    this.rooms.get(roomName)!.add(ws);
  }

  private leaveRoom(ws: AuthenticatedWebSocket, roomName: string) {
    const room = this.rooms.get(roomName);
    if (room) {
      room.delete(ws);
      if (room.size === 0) {
        this.rooms.delete(roomName);
      }
    }
  }

  private leaveAllRooms(ws: AuthenticatedWebSocket) {
    for (const [roomName, room] of this.rooms.entries()) {
      if (room.has(ws)) {
        this.leaveRoom(ws, roomName);
      }
    }
  }

  private broadcastToRoom(roomName: string, message: WSMessage) {
    const room = this.rooms.get(roomName);
    if (room) {
      const messageStr = JSON.stringify(message);
      room.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
        }
      });
    }
  }

  public handleUpgrade(request: IncomingMessage, socket: any, head: Buffer) {
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss.emit("connection", ws, request);
    });
  }
}

export function setupWebSocketServer(server: any): WebSocketManager {
  return new WebSocketManager(server);
}
