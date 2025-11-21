# Fakecode - LeetCode Clone

A full-stack coding platform inspired by LeetCode, built with modern web technologies. Submit code solutions to algorithmic problems, get real-time feedback, and track your progress in a competitive coding environment.

## 🚀 Features

- **Problem Solving**: Browse and solve coding problems across multiple difficulty levels and categories
- **Real-time Submissions**: Submit code in multiple languages with instant status updates via WebSockets
- **Code Execution**: Worker-based system for processing and judging submissions
- **User Interface**: Clean, responsive Next.js frontend with code editor
- **Scalable Backend**: Express.js API with Redis for queuing and pub/sub messaging
- **Multi-language Support**: JavaScript, Python, Java, C++ (extensible)
- **WebSocket Integration**: Live status updates for submissions
- **Modern Tech Stack**: TypeScript, Bun runtime, Redis, Express, Next.js

## 🛠 Tech Stack

### Backend

- **Runtime**: Bun
- **Framework**: Express.js
- **Database/Queue**: Redis
- **WebSockets**: ws library
- **Language**: TypeScript

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React hooks
- **WebSockets**: Native WebSocket API
- **Language**: TypeScript

### Worker

- **Runtime**: Bun
- **Queue Processing**: Redis BRPOP
- **Pub/Sub**: Redis publish/subscribe
- **Language**: TypeScript

## 📁 Project Structure

```
fakecode/
├── backend/          # Express.js API server
│   ├── src/
│   │   └── index.ts  # Main server file with WebSocket support
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # Next.js web application
│   ├── app/          # App Router pages and components
│   ├── public/       # Static assets
│   ├── package.json
│   └── tsconfig.json
├── worker/           # Background job processor
│   ├── src/
│   │   └── index.ts  # Submission processing logic
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🏃‍♂️ Quick Start

### Prerequisites

- [Bun](https://bun.sh) (latest version)
- [Redis](https://redis.io) (running locally or via Docker)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fakecode
   ```

2. **Install dependencies for all services**

   ```bash
   # Backend
   cd backend && bun install

   # Frontend
   cd ../frontend && bun install

   # Worker
   cd ../worker && bun install
   ```

3. **Start Redis**

   ```bash
   # Using Docker
   docker run -d -p 6379:6379 redis:alpine

   # Or install Redis locally and run:
   redis-server
   ```

4. **Start the services**

   ```bash
   # Terminal 1: Backend (port 8080)
   cd backend && bun dev

   # Terminal 2: Frontend (port 3000)
   cd frontend && bun dev

   # Terminal 3: Worker
   cd worker && bun dev
   ```

5. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000) to access the application.

## 📖 Usage

1. **Submit a Problem**: Fill in the problem ID, user ID, select a language, and paste your code
2. **Real-time Updates**: Watch the submission status update live via WebSocket
3. **Monitor Connection**: The UI shows WebSocket connection status and allows reconnection

## 🏗 Architecture

### Backend (Express + Redis)

- Handles HTTP requests for code submissions
- Manages WebSocket connections for real-time updates
- Uses Redis as a message queue and pub/sub system

### Frontend (Next.js)

- Provides a user-friendly interface for code submission
- Maintains WebSocket connection for status updates
- Displays submission results and connection status

### Worker (Redis Consumer)

- Processes submissions from the Redis queue
- Simulates code execution (currently accepts all submissions)
- Publishes status updates back to subscribers

### Data Flow

1. User submits code via frontend
2. Backend pushes submission to Redis queue
3. Worker pops submission, processes it, publishes status
4. Backend receives status via Redis pub/sub and sends to WebSocket clients
5. Frontend displays real-time updates

## 🔧 Development

### Adding New Languages

1. Update the language selector in `frontend/app/page.tsx`
2. Modify worker logic in `worker/src/index.ts` to handle new languages

### Extending the Judge

Currently, the worker simulates processing. To add real code execution:

1. Implement sandboxing (Docker, Firejail, etc.)
2. Add test case validation
3. Integrate with compilers/interpreters for each language

### Environment Variables

Create `.env` files in each service directory for configuration:

- Redis connection URL
- Port numbers
- Database credentials (if added)

## 🎯 Future Enhancements

- User authentication and profiles
- Problem database with categories and difficulties
- Real code execution with test cases
- Leaderboards and contests
- Discussion forums
- Mobile application
- Admin panel for problem management

---

Built with ❤️ using modern web technologies. Inspired by LeetCode's platform for learning and practicing coding skills.
