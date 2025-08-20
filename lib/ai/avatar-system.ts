import * as THREE from "three";

export interface AvatarEmotion {
  joy: number;      // 0-1
  empathy: number;  // 0-1
  concern: number;  // 0-1
  curiosity: number; // 0-1
  neutral: number;  // 0-1
}

export interface AvatarGesture {
  headTilt: number;    // -1 to 1 (left to right)
  headNod: number;     // -1 to 1 (down to up)
  eyebrowRaise: number; // 0-1
  smile: number;       // 0-1
  blink: boolean;      // true/false
}

export interface AvatarState {
  emotion: AvatarEmotion;
  gesture: AvatarGesture;
  speaking: boolean;
  lipSync: number; // 0-1 for mouth opening
}

export class AIAvatarSystem {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private avatar: THREE.Group;
  private canvas: HTMLCanvasElement;
  private stream: MediaStream | null = null;
  private currentState: AvatarState;
  private animationFrame: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.currentState = this.getDefaultState();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.avatar = new THREE.Group();

    this.initialize();
  }

  private getDefaultState(): AvatarState {
    return {
      emotion: {
        joy: 0.3,
        empathy: 0.5,
        concern: 0,
        curiosity: 0.2,
        neutral: 0.8,
      },
      gesture: {
        headTilt: 0,
        headNod: 0,
        eyebrowRaise: 0,
        smile: 0.2,
        blink: false,
      },
      speaking: false,
      lipSync: 0,
    };
  }

  private initialize(): void {
    // Setup renderer
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.renderer.setClearColor(0x000000, 0);

    // Setup camera
    this.camera.position.z = 5;

    // Setup lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    this.scene.add(directionalLight);

    // Create avatar
    this.createAvatar();
    this.scene.add(this.avatar);

    // Start animation loop
    this.animate();
  }

  private createAvatar(): void {
    // Create head
    const headGeometry = new THREE.SphereGeometry(1, 32, 32);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    this.avatar.add(head);

    // Create eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 0.2, 0.8);
    head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 0.2, 0.8);
    head.add(rightEye);

    // Create eyebrows
    const eyebrowGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.05);
    const eyebrowMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });

    const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    leftEyebrow.position.set(-0.3, 0.4, 0.8);
    head.add(leftEyebrow);

    const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
    rightEyebrow.position.set(0.3, 0.4, 0.8);
    head.add(rightEyebrow);

    // Create mouth
    const mouthGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.05);
    const mouthMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.3, 0.8);
    head.add(mouth);

    // Store references for animation
    (this.avatar as any).head = head;
    (this.avatar as any).leftEye = leftEye;
    (this.avatar as any).rightEye = rightEye;
    (this.avatar as any).leftEyebrow = leftEyebrow;
    (this.avatar as any).rightEyebrow = rightEyebrow;
    (this.avatar as any).mouth = mouth;
  }

  private animate(): void {
    this.animationFrame = requestAnimationFrame(() => this.animate());
    this.updateAvatar();
    this.renderer.render(this.scene, this.camera);
  }

  private updateAvatar(): void {
    const head = (this.avatar as any).head;
    const leftEye = (this.avatar as any).leftEye;
    const rightEye = (this.avatar as any).rightEye;
    const leftEyebrow = (this.avatar as any).leftEyebrow;
    const rightEyebrow = (this.avatar as any).rightEyebrow;
    const mouth = (this.avatar as any).mouth;

    if (!head || !leftEye || !rightEye || !leftEyebrow || !rightEyebrow || !mouth) {
return;
}

    // Update head rotation based on gestures
    head.rotation.y = this.currentState.gesture.headTilt * 0.3;
    head.rotation.x = this.currentState.gesture.headNod * 0.2;

    // Update eyebrows based on emotion and gesture
    const eyebrowHeight = this.currentState.gesture.eyebrowRaise * 0.1;
    leftEyebrow.position.y = 0.4 + eyebrowHeight;
    rightEyebrow.position.y = 0.4 + eyebrowHeight;

    // Update mouth for lip sync and smile
    const mouthScale = this.currentState.speaking ?
      1 + this.currentState.lipSync * 0.5 :
      1 + this.currentState.gesture.smile * 0.3;
    mouth.scale.y = mouthScale;

    // Blinking animation
    if (this.currentState.gesture.blink) {
      leftEye.scale.y = 0.1;
      rightEye.scale.y = 0.1;
    } else {
      leftEye.scale.y = 1;
      rightEye.scale.y = 1;
    }

    // Update colors based on emotion
    const dominantEmotion = this.getDominantEmotion();
    const headMaterial = head.material as THREE.MeshLambertMaterial;

    switch (dominantEmotion) {
      case "joy":
        headMaterial.color.setHex(0xffdbac);
        break;
      case "empathy":
        headMaterial.color.setHex(0xffe4b5);
        break;
      case "concern":
        headMaterial.color.setHex(0xf5d0c5);
        break;
      case "curiosity":
        headMaterial.color.setHex(0xfff0db);
        break;
      default:
        headMaterial.color.setHex(0xffdbac);
    }
  }

  private getDominantEmotion(): string {
    const emotions = this.currentState.emotion;
    const maxValue = Math.max(emotions.joy, emotions.empathy, emotions.concern, emotions.curiosity, emotions.neutral);

    if (maxValue === emotions.joy) {
return "joy";
}
    if (maxValue === emotions.empathy) {
return "empathy";
}
    if (maxValue === emotions.concern) {
return "concern";
}
    if (maxValue === emotions.curiosity) {
return "curiosity";
}
    return "neutral";
  }

  // Public methods
  updateEmotion(emotion: Partial<AvatarEmotion>): void {
    this.currentState.emotion = { ...this.currentState.emotion, ...emotion };
  }

  updateGesture(gesture: Partial<AvatarGesture>): void {
    this.currentState.gesture = { ...this.currentState.gesture, ...gesture };
  }

  setSpeaking(speaking: boolean): void {
    this.currentState.speaking = speaking;
  }

  updateLipSync(intensity: number): void {
    this.currentState.lipSync = Math.max(0, Math.min(1, intensity));
  }

  // Analyze text sentiment and update avatar accordingly
  analyzeSentiment(text: string): void {
    const lowerText = text.toLowerCase();

    // Simple sentiment analysis (in production, use a proper NLP service)
    let joy = 0.3;
    let empathy = 0.5;
    let concern = 0;
    let curiosity = 0.2;
    let neutral = 0.8;

    // Joy indicators
    if (lowerText.includes("great") || lowerText.includes("wonderful") || lowerText.includes("amazing")) {
      joy = 0.8;
      neutral = 0.3;
    }

    // Empathy indicators
    if (lowerText.includes("understand") || lowerText.includes("feel") || lowerText.includes("sorry")) {
      empathy = 0.8;
      neutral = 0.4;
    }

    // Concern indicators
    if (lowerText.includes("worried") || lowerText.includes("concerned") || lowerText.includes("difficult")) {
      concern = 0.7;
      neutral = 0.3;
    }

    // Curiosity indicators
    if (lowerText.includes("tell me") || lowerText.includes("how") || lowerText.includes("what")) {
      curiosity = 0.7;
      neutral = 0.4;
    }

    this.updateEmotion({ joy, empathy, concern, curiosity, neutral });
  }

  // Generate natural gestures
  generateGestures(): void {
    // Random head movements
    const headTilt = (Math.random() - 0.5) * 0.3;
    const headNod = Math.sin(Date.now() * 0.001) * 0.1;

    // Occasional eyebrow raise
    const eyebrowRaise = Math.random() > 0.95 ? 0.5 : 0;

    // Natural blinking
    const blink = Math.random() > 0.98;

    // Subtle smile variations
    const smile = 0.2 + Math.sin(Date.now() * 0.002) * 0.1;

    this.updateGesture({
      headTilt,
      headNod,
      eyebrowRaise,
      smile,
      blink,
    });
  }

  // Get the video stream from the avatar
  getStream(): MediaStream | null {
    if (!this.stream) {
      this.stream = this.canvas.captureStream(30);
    }
    return this.stream;
  }

  // Cleanup
  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.renderer.dispose();
  }
}
