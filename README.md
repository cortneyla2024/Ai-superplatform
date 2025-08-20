# steward-omni-max

**Hope: The Steward – Omni Max**

A complete, self-hostable, privacy-first platform that evolves autonomously and respects ethics and compliance.

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-green.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-8.x-blue.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/steward-omni-max.git
cd steward-omni-max

# Setup and start the platform
make setup
make up PROFILE=free
```

Visit http://localhost:3000 and login with:
- **Email:** demo@hope.local
- **Password:** Passw0rd!

## ✨ Features

### 🤖 Ascended AI Core
- **Personas:** Educator, Therapist, Creative, Legal Advocate, Financial Advisor, Coach, Engineer
- **Memory Hooks:** Persistent context and learning
- **"Why" Explanations:** Transparent reasoning with bias checks
- **Disclaimers:** For sensitive topics and recommendations

### 🏗️ Genesis Foundry
- **Knowledge Mining:** Public data adapters and micro-model registry
- **Knowledge Graph:** Personal knowledge network
- **Free Service Generators:** Open-source alternatives

### 🎯 Universal Concierge
- **Task Automation:** Research, tutorials, design, travel planning, site creation
- **Contract Analysis:** Legal document review and insights
- **Budget Planning:** Financial optimization and goal setting
- **Habit Coaching:** Behavioral change support
- **Meeting Briefs:** AI-powered meeting preparation
- **Code Review:** Technical assessment and suggestions
- **Incident Runbooks:** Emergency response automation
- **Translation & Summarization:** Multi-language support

### 🌱 Life Modules

#### Wellness
- **Mental Health Assessment:** PHQ-9, GAD-7, and custom assessments
- **Mood Tracking:** Daily mood entries with insights
- **Coping Strategies:** Personalized stress management techniques

#### Finance
- **Budget Management:** Multi-category budgeting with alerts
- **Transaction Tracking:** Automatic categorization and insights
- **Financial Goals:** Goal setting and progress tracking

#### Learning
- **Skill Development:** Progress tracking with spaced repetition
- **Habit Formation:** Daily habit logging and streak tracking
- **Resource Management:** Learning material organization

#### Creativity
- **Creative Projects:** Project management for artistic endeavors
- **Generated Assets:** AI-assisted creative content
- **Media Preferences:** Personalized recommendations

#### Community
- **Community Building:** Group formation and management
- **Event Planning:** Event creation and participation tracking
- **Social Networking:** Post and comment system

#### Automation
- **Routine Automation:** Trigger-based automation workflows
- **Smart Notifications:** Context-aware alerts
- **Integration Hub:** Connector ecosystem

### 🏠 Specialized Modules

#### Empathic Resonance
- **Family Circles:** Multi-generational family support
- **Guided Conversations:** AI-facilitated family discussions
- **Emotional Intelligence:** Relationship building tools

#### Dream Weaver
- **Generated Games:** AI-created educational games
- **Activity Planning:** Personalized activity recommendations
- **Creative Expression:** Artistic and imaginative development

## 🏗️ Architecture

### Monorepo Structure
```
/
├── apps/
│   ├── web/          # Next.js 14 (App Router, TS, Tailwind, shadcn/ui)
│   ├── api/          # NestJS (TS), Prisma, Redis, BullMQ, Socket.io
│   ├── broker/       # Job runners, connector orchestration
│   ├── ext/          # Browser extension (MV3)
│   ├── mobile/       # Expo (React Native) offline-first
│   ├── desktop/      # Tauri desktop vault
│   └── docs/         # Docusaurus documentation
├── packages/
│   ├── ui/           # Design system (Bloom theme)
│   ├── types/        # Shared TypeScript types
│   ├── config/       # ESLint, Prettier, Jest, Playwright
│   ├── connectors/   # OAuth, webhooks, typed clients
│   ├── rpa/          # Playwright-based RPA toolkit
│   ├── graphs/       # Knowledge graph schema
│   ├── guards/       # Consent & policy engine
│   ├── agents/       # Multi-agent kernel
│   ├── media/        # STT/TTS audio pipelines
│   └── crdt/         # Yjs offline-first sync
└── infra/
    ├── docker/       # Hardened Dockerfiles
    ├── k8s/          # Helm charts
    ├── db/           # Prisma migrations & seeds
    └── edge/         # Edge worker
```

### Technology Stack

#### Frontend
- **Next.js 14** with App Router
- **TypeScript** with strict configuration
- **Tailwind CSS** with custom Bloom theme
- **shadcn/ui** components
- **Radix UI** primitives
- **Three.js** for 3D avatars
- **WebRTC** for real-time communication
- **Zustand** for state management
- **TanStack Query** for data fetching

#### Backend
- **NestJS** with TypeScript
- **Prisma ORM** with PostgreSQL
- **Redis** for caching and sessions
- **BullMQ** for job queues
- **Socket.io** for real-time features
- **Casbin** for RBAC authorization

#### AI & ML
- **Local-first:** Ollama with opt-in external models
- **Embeddings:** pgvector for semantic search
- **Speech:** Whisper.cpp and Piper for STT/TTS
- **Vision:** CLIP for image understanding

#### Security & Privacy
- **Authentication:** NextAuth.js v5 with email/TOTP
- **Authorization:** Casbin RBAC with scope-based access
- **Encryption:** E2E encryption for sensitive data
- **CSP:** Strict Content Security Policy
- **GDPR:** Data export, deletion, and consent management

#### Observability
- **Logging:** Pino with correlation IDs
- **Tracing:** OpenTelemetry
- **Metrics:** Prometheus
- **Health Checks:** /health and /ready endpoints

## 🔧 Development

### Prerequisites
- **Node.js 20** LTS
- **pnpm 8** or later
- **Docker** and **Docker Compose**
- **Git**

### Setup
```bash
# Install dependencies
make setup

# Start development environment
make up PROFILE=free

# Run tests
make test

# Build for production
make build
```

### Available Commands
```bash
make help              # Show all available commands
make setup             # Install dependencies and setup environment
make lint              # Run ESLint with zero warnings
make typecheck         # Run TypeScript strict checks
make test              # Run all tests with coverage
make build             # Build all packages and apps
make docker            # Build Docker images
make up                # Start development stack
make down              # Stop development stack
make clean             # Clean all artifacts
make release           # Build production release
make deploy            # Deploy to production
make rotate-secrets    # Rotate secrets and re-seed users
make backup            # Create database backup
make restore           # Restore from backup
```

## 🌐 Free-First Connector Fabric

### Identity & Auth
- **Native:** Email + TOTP authentication
- **Optional:** OpenID Connect integration

### Files & Notes
- **Local Vault:** Encrypted local storage
- **WebDAV:** Nextcloud, ownCloud integration
- **File ETL:** Automatic vector indexing

### Productivity
- **CalDAV/CardDAV:** Calendar and contact sync
- **Markdown Vault:** Local document management
- **Optional:** Notion, Slack, Google integration

### Development & Operations
- **Gitea:** Self-hosted Git server
- **Grafana:** Monitoring dashboards
- **Prometheus:** Metrics collection
- **Loki:** Log aggregation

### Finance
- **CSV/OFX Import:** Manual data import
- **Optional:** Plaid, Open Banking integration

### Health
- **Local FHIR Sandbox:** Health data management
- **Optional:** SMART on FHIR integration

### Messaging
- **Matrix:** Decentralized messaging
- **SMTP/IMAP:** Email integration

### Social
- **RSS:** Feed aggregation
- **ActivityPub:** Federated social networking
- **Optional:** External social media integration

### IoT & Home
- **Home Assistant:** Smart home automation
- **Matter:** IoT device management
- **Hue:** Philips Hue integration

### Maps & Travel
- **OpenStreetMap:** Open mapping data
- **Nominatim:** Geocoding service
- **Valhalla:** Routing engine

## 🔒 Security & Privacy

### Privacy-First Design
- **Local AI:** Default to on-device processing
- **Data Minimization:** Collect only necessary data
- **Consent Management:** Granular consent controls
- **Purpose Binding:** Data usage restrictions

### Security Features
- **E2E Encryption:** For sensitive communications
- **Secure Cookies:** httpOnly, secure, sameSite
- **CSP:** Strict Content Security Policy
- **Rate Limiting:** API abuse prevention
- **SSRF Protection:** Server-side request forgery prevention
- **Secret Scanning:** Automated secret detection

### Compliance
- **GDPR:** Data protection compliance
- **Accessibility:** WCAG AA compliance
- **Bias Checks:** AI recommendation auditing
- **Audit Logging:** Complete activity tracking

## 📚 Documentation

- **Architecture:** System design and patterns
- **Security & Privacy:** Security model and privacy controls
- **Runbook:** Operational procedures
- **API Reference:** Complete API documentation
- **ADRs:** Architecture Decision Records
- **Threat Model:** Security threat analysis

Visit http://localhost:3001 for complete documentation.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Standards
- **TypeScript:** Strict mode with no `any`
- **ESLint:** Zero warnings policy
- **Prettier:** Consistent formatting
- **Tests:** 90%+ coverage required
- **Accessibility:** WCAG AA compliance

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

- **Apps/Services:** AGPL-3.0
- **Libraries/Packages:** MIT
- **Documentation:** CC-BY-SA 4.0

See [COPYING.md](COPYING.md) for license obligations and [NOTICE](NOTICE) for third-party attributions.

## 🆘 Support

- **Documentation:** http://localhost:3001
- **Issues:** [GitHub Issues](https://github.com/your-org/steward-omni-max/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/steward-omni-max/discussions)
- **Security:** security@steward-omni-max.org

## 🙏 Acknowledgments

- **Free Software Foundation** for the AGPL-3.0 license
- **Open Source Community** for the amazing tools and libraries
- **Contributors** who make this platform possible

---

**Hope: The Steward – Omni Max** - Empowering individuals with privacy-first, autonomous AI assistance.


