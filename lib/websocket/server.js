const { WebSocketServer, WebSocket } = require("ws");

class WebSocketManager {
  constructor(server) {
    this.wss = new WebSocketServer({ noServer: true });
    this.rooms = new Map();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.wss.on("connection", (ws, request) => {
      this.handleConnection(ws, request);
    });
  }

  async handleConnection(ws, request) {
    try {
      // For now, skip authentication to get the server running
      ws.userId = "anonymous";
      ws.username = "Anonymous";

      // Add to default room
      this.joinRoom(ws, "general");

      // Send welcome message
      const welcomeMessage = {
        type: "system",
        content: "Welcome! You've joined the chat.",
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(welcomeMessage));

      // Handle incoming messages
      ws.on("message", async(data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error("Error handling message:", error);
          const errorMessage = {
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

  async handleMessage(ws, message) {
    if (message.type === "message") {
      // Broadcast to room
      this.broadcastToRoom("general", {
        type: "message",
        content: message.content,
        userId: ws.userId,
        username: ws.username,
        timestamp: new Date().toISOString(),
      });

      // Simple echo response for now
      const echoResponse = {
        type: "message",
        content: `Echo: ${message.content}`,
        userId: "ai",
        username: "AI Companion",
        timestamp: new Date().toISOString(),
      };

      this.broadcastToRoom("general", echoResponse);
    }
  }

  joinRoom(ws, roomName) {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    this.rooms.get(roomName).add(ws);
  }

  leaveRoom(ws, roomName) {
    const room = this.rooms.get(roomName);
    if (room) {
      room.delete(ws);
      if (room.size === 0) {
        this.rooms.delete(roomName);
      }
    }
  }

  leaveAllRooms(ws) {
    for (const [roomName, room] of this.rooms.entries()) {
      if (room.has(ws)) {
        this.leaveRoom(ws, roomName);
      }
    }
  }

  broadcastToRoom(roomName, message) {
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

  handleUpgrade(request, socket, head) {
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss.emit("connection", ws, request);
    });
  }
}

function setupWebSocketServer(server) {
  return new WebSocketManager(server);
}

module.exports = { setupWebSocketServer };
