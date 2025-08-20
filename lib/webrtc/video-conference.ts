import { io, Socket } from "socket.io-client";

export interface VideoStream {
  id: string;
  stream: MediaStream;
  isAI: boolean;
  isLocal: boolean;
}

export interface VideoConferenceConfig {
  roomId: string;
  userId: string;
  enableAudio: boolean;
  enableVideo: boolean;
  enableAI: boolean;
}

export class VideoConference {
  private socket: Socket | null = null;
  private localStream: MediaStream | null = null;
  private aiStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private streams: VideoStream[] = [];
  private config: VideoConferenceConfig;
  private onStreamUpdate: ((streams: VideoStream[]) => void) | null = null;
  private onMessage: ((message: any) => void) | null = null;

  constructor(config: VideoConferenceConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize WebRTC adapter
      await import("webrtc-adapter");

      // Connect to signaling server
      this.socket = io(process.env.NEXT_PUBLIC_SIGNALING_SERVER || "http://localhost:3001", {
        query: {
          roomId: this.config.roomId,
          userId: this.config.userId,
        },
      });

      this.setupSocketHandlers();
      await this.setupLocalStream();

      if (this.config.enableAI) {
        await this.setupAIStream();
      }
    } catch (error) {
      console.error("Failed to initialize video conference:", error);
      throw error;
    }
  }

  private setupSocketHandlers(): void {
    if (!this.socket) {
return;
}

    this.socket.on("user-joined", async(data: { userId: string }) => {
      console.log("User joined:", data.userId);
      await this.createPeerConnection(data.userId);
    });

    this.socket.on("user-left", (data: { userId: string }) => {
      console.log("User left:", data.userId);
      this.removePeerConnection(data.userId);
    });

    this.socket.on("offer", async(data: { from: string; offer: RTCSessionDescriptionInit }) => {
      await this.handleOffer(data.from, data.offer);
    });

    this.socket.on("answer", async(data: { from: string; answer: RTCSessionDescriptionInit }) => {
      await this.handleAnswer(data.from, data.answer);
    });

    this.socket.on("ice-candidate", async(data: { from: string; candidate: RTCIceCandidateInit }) => {
      await this.handleIceCandidate(data.from, data.candidate);
    });

    this.socket.on("ai-message", (message: any) => {
      if (this.onMessage) {
        this.onMessage(message);
      }
    });
  }

  private async setupLocalStream(): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: this.config.enableAudio,
        video: this.config.enableVideo ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        } : false,
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

      const localVideoStream: VideoStream = {
        id: "local",
        stream: this.localStream,
        isAI: false,
        isLocal: true,
      };

      this.streams.push(localVideoStream);
      this.updateStreams();
    } catch (error) {
      console.error("Failed to get local stream:", error);
      throw error;
    }
  }

  private async setupAIStream(): Promise<void> {
    try {
      // Create a canvas-based stream for AI avatar
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
throw new Error("Failed to get canvas context");
}

      // Create a simple AI avatar (placeholder - will be enhanced with 3D avatar)
      const drawAIAvatar = () => {
        ctx.fillStyle = "#1f2937";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw AI avatar placeholder
        ctx.fillStyle = "#8b5cf6";
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("AI", canvas.width / 2, canvas.height / 2 + 16);
      };

      drawAIAvatar();

      // Create stream from canvas
      this.aiStream = canvas.captureStream(30);

      const aiVideoStream: VideoStream = {
        id: "ai",
        stream: this.aiStream,
        isAI: true,
        isLocal: false,
      };

      this.streams.push(aiVideoStream);
      this.updateStreams();
    } catch (error) {
      console.error("Failed to setup AI stream:", error);
      throw error;
    }
  }

  private async createPeerConnection(userId: string): Promise<void> {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Add AI stream tracks if available
    if (this.aiStream) {
      this.aiStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.aiStream!);
      });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) {
        const videoStream: VideoStream = {
          id: userId,
          stream,
          isAI: false,
          isLocal: false,
        };

        // Replace existing stream or add new one
        const existingIndex = this.streams.findIndex(s => s.id === userId);
        if (existingIndex >= 0) {
          this.streams[existingIndex] = videoStream;
        } else {
          this.streams.push(videoStream);
        }
        this.updateStreams();
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit("ice-candidate", {
          to: userId,
          candidate: event.candidate,
        });
      }
    };

    this.peerConnections.set(userId, peerConnection);

    // Create and send offer
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      if (this.socket) {
        this.socket.emit("offer", {
          to: userId,
          offer,
        });
      }
    } catch (error) {
      console.error("Failed to create offer:", error);
    }
  }

  private async handleOffer(from: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Add AI stream tracks if available
    if (this.aiStream) {
      this.aiStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.aiStream!);
      });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      const stream = event.streams[0];
      if (stream) {
        const videoStream: VideoStream = {
          id: from,
          stream,
          isAI: false,
          isLocal: false,
        };

        const existingIndex = this.streams.findIndex(s => s.id === from);
        if (existingIndex >= 0) {
          this.streams[existingIndex] = videoStream;
        } else {
          this.streams.push(videoStream);
        }
        this.updateStreams();
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit("ice-candidate", {
          to: from,
          candidate: event.candidate,
        });
      }
    };

    this.peerConnections.set(from, peerConnection);

    try {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (this.socket) {
        this.socket.emit("answer", {
          to: from,
          answer,
        });
      }
    } catch (error) {
      console.error("Failed to handle offer:", error);
    }
  }

  private async handleAnswer(from: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.peerConnections.get(from);
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(answer);
      } catch (error) {
        console.error("Failed to handle answer:", error);
      }
    }
  }

  private async handleIceCandidate(from: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = this.peerConnections.get(from);
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (error) {
        console.error("Failed to handle ICE candidate:", error);
      }
    }
  }

  private removePeerConnection(userId: string): void {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
    }

    // Remove stream
    this.streams = this.streams.filter(s => s.id !== userId);
    this.updateStreams();
  }

  private updateStreams(): void {
    if (this.onStreamUpdate) {
      this.onStreamUpdate([...this.streams]);
    }
  }

  // Public methods
  onStreamsUpdate(callback: (streams: VideoStream[]) => void): void {
    this.onStreamUpdate = callback;
  }

  onAIMessage(callback: (message: any) => void): void {
    this.onMessage = callback;
  }

  async sendAIMessage(message: any): Promise<void> {
    if (this.socket) {
      this.socket.emit("ai-message", message);
    }
  }

  async toggleAudio(enabled: boolean): Promise<void> {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }

  async toggleVideo(enabled: boolean): Promise<void> {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }

  async disconnect(): Promise<void> {
    // Close all peer connections
    for (const [userId, peerConnection] of this.peerConnections) {
      peerConnection.close();
    }
    this.peerConnections.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Stop AI stream
    if (this.aiStream) {
      this.aiStream.getTracks().forEach(track => track.stop());
      this.aiStream = null;
    }

    // Disconnect socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // Clear streams
    this.streams = [];
    this.updateStreams();
  }

  getStreams(): VideoStream[] {
    return [...this.streams];
  }
}
