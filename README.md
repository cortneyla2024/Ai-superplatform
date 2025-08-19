# AI Life Companion

A revolutionary, self-hosted AI companion for life with complete privacy and zero cost. Experience personalized support, learning, creativity, and growth powered by local AI processing.

## 🌟 Features

### 🤖 AI Life Companion
- **Personal AI Companion**: Face-to-face conversations with 3D avatar visualization
- **Emotional Intelligence**: Empathetic responses and emotional support
- **Memory & Context**: Remembers your preferences and conversation history
- **Goal Assistance**: Help with setting and achieving personal goals
- **Health Guidance**: Wellness advice and health tracking support

### 🎵 Sonic Canvas
- **AI Music Generation**: Create beautiful compositions from text descriptions
- **Real-time Playback**: Listen to generated music instantly
- **Custom Prompts**: Describe your musical vision in natural language
- **Tone.js Integration**: High-quality audio synthesis

### 🎓 AI Teacher
- **Learning Companion**: Ask questions about any topic
- **Contextual Responses**: Personalized learning based on your knowledge level
- **Interactive Sessions**: Engaging educational conversations
- **Knowledge Base**: Access to comprehensive information

### 🎯 Goal Tracking
- **Smart Goal Setting**: AI-assisted goal creation and planning
- **Progress Monitoring**: Track your achievements and milestones
- **Motivational Support**: Get encouragement and guidance
- **Analytics**: Visual progress tracking and insights

### 📝 Digital Journal
- **Secure Journaling**: Private, encrypted journal entries
- **AI Insights**: Get emotional analysis and patterns from your writing
- **Mood Tracking**: Monitor your emotional well-being over time
- **Tagging System**: Organize entries with custom tags

### ❤️ Health & Wellness
- **Mood Tracking**: Daily emotional state monitoring
- **Sleep Quality**: Track and analyze sleep patterns
- **Activity Monitoring**: Physical activity and wellness metrics
- **AI Health Guidance**: Personalized wellness recommendations

### 🔍 Smart Search
- **AI-Powered Search**: Advanced search with semantic understanding
- **Knowledge Indexing**: Intelligent content organization
- **Quick Access**: Find information across all your data
- **Search History**: Track and learn from your search patterns

### 📊 Analytics Dashboard
- **Usage Insights**: Track your AI interactions and patterns
- **Progress Reports**: Visualize your growth and achievements
- **Health Metrics**: Comprehensive wellness analytics
- **Goal Analytics**: Detailed goal achievement tracking

## 🛠️ Technology Stack

### Core Technologies
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **AI Backend**: Ollama (local LLM inference)
- **3D Graphics**: Three.js for avatar visualization
- **Audio**: Tone.js for music synthesis
- **Real-time**: WebSocket for live communication

### Self-Hosted Architecture
- **100% Local Processing**: All AI operations run on your hardware
- **Zero External Dependencies**: No cloud APIs or external services
- **Complete Privacy**: Your data never leaves your system
- **Docker Deployment**: Easy containerized setup
- **PostgreSQL Database**: Robust, scalable data storage

## 🚀 Quick Start

### Prerequisites
1. **Docker & Docker Compose** installed
2. **Ollama** installed from [ollama.com](https://ollama.com)
3. **Node.js 18+** (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-life-companion
   ```

2. **Install Ollama and download a model**
   ```bash
   # Install Ollama (follow instructions at ollama.com)
   ollama pull llama3
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the application**
   ```bash
   # Using Docker (recommended)
   docker-compose up --build
   
   # Or for development
   npm install
   npm run dev
   ```

5. **Initialize the database**
   ```bash
   npm run init-db
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
ai-life-companion/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── ai/                   # AI companion endpoints
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── music/                # Music generation endpoints
│   │   └── search/               # Search functionality
│   ├── components/               # React components
│   │   ├── ai/                   # AI companion components
│   │   ├── music/                # Music generation components
│   │   ├── learning/             # AI teacher components
│   │   └── ui/                   # Shared UI components
│   ├── lib/                      # Utility libraries
│   │   ├── auth.ts               # Authentication utilities
│   │   ├── db/                   # Database utilities
│   │   ├── ai/                   # AI integration
│   │   └── websocket/            # Real-time communication
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main application page
├── prisma/                       # Database schema and migrations
├── public/                       # Static assets
├── data/                         # Local data storage
├── docker-compose.yml            # Docker orchestration
├── Dockerfile                    # Application container
└── package.json                  # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://ailifecompanion:secure_password_123@localhost:5432/ailifecompanion?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-nextauth-key"

# Ollama Configuration
OLLAMA_API_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"
```

### Ollama Model Selection

The application is configured to use `llama3` by default. You can change this by:

1. **Downloading a different model**:
   ```bash
   ollama pull mistral
   ollama pull codellama
   ollama pull llama2
   ```

2. **Updating the environment variable**:
   ```env
   OLLAMA_MODEL="mistral"
   ```

## 🔒 Security & Privacy

### Data Protection
- **End-to-End Encryption**: All sensitive data is encrypted
- **Local Storage**: Your data never leaves your system
- **No External APIs**: Complete privacy with local AI processing
- **User Control**: Full control over your data and settings

### Authentication
- **JWT Tokens**: Secure session management
- **Password Hashing**: bcrypt for secure password storage
- **Session Management**: Automatic session cleanup
- **Access Control**: Role-based permissions

## 📈 Performance

### Optimization Features
- **Server-Side Rendering**: Fast initial page loads
- **Code Splitting**: Efficient bundle loading
- **Caching**: Intelligent data caching
- **Database Indexing**: Optimized queries
- **WebSocket**: Real-time communication

### Resource Requirements
- **Minimum RAM**: 8GB (16GB recommended for AI models)
- **Storage**: 10GB for application + AI model size
- **CPU**: Multi-core processor recommended
- **GPU**: Optional, for faster AI inference

## 🚀 Deployment

### Docker Deployment (Recommended)
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Development deployment
docker-compose up --build
```

### Manual Deployment
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the server
npm start
```

### Cloud Deployment
The application can be deployed to any cloud platform that supports Docker:
- **AWS**: ECS or EC2 with Docker
- **Google Cloud**: Cloud Run or GKE
- **Azure**: Container Instances or AKS
- **DigitalOcean**: App Platform or Droplets

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd ai-life-companion

# Install dependencies
npm install

# Set up development environment
cp .env.example .env.local

# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ollama Team**: For the amazing local LLM framework
- **Next.js Team**: For the excellent React framework
- **Prisma Team**: For the powerful database toolkit
- **Three.js Team**: For the 3D graphics library
- **Tone.js Team**: For the audio synthesis library

## 📞 Support

- **Documentation**: [docs.ai-life-companion.com](https://docs.ai-life-companion.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/ai-life-companion/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/ai-life-companion/discussions)
- **Email**: support@ai-life-companion.com

## 🔮 Roadmap

### Upcoming Features
- **Voice Interaction**: Speech-to-text and text-to-speech
- **Advanced Avatar**: More sophisticated 3D character models
- **Mobile App**: Native iOS and Android applications
- **Multi-User Support**: Family and team accounts
- **API Integration**: Connect with health devices and apps
- **Advanced Analytics**: Machine learning insights
- **Plugin System**: Extensible functionality
- **Offline Mode**: Full offline operation

### Long-term Vision
- **AI Evolution**: Continuous improvement of AI capabilities
- **Community Features**: User communities and sharing
- **Research Integration**: Academic and research partnerships
- **Global Accessibility**: Multi-language support
- **Enterprise Features**: Business and organizational tools

---

**AI Life Companion** - Your revolutionary, self-hosted AI companion for life. Experience the future of personal AI with complete privacy and zero cost.


