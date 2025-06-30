# URL Shortener

A modern URL shortener application built with Next.js frontend and NestJS backend.

## Features

- 🔗 Create short URLs from long URLs
- 📊 Track click analytics
- 🎨 Modern, responsive UI
- ⚡ Fast redirects
- 🔒 Secure URL generation
- 📱 Mobile-friendly design

## Tech Stack

### Frontend (Next.js)
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- React Hook Form
- Axios for API calls

### Backend (NestJS)
- NestJS framework
- TypeScript
- SQLite database (can be easily changed to PostgreSQL/MySQL)
- TypeORM for database management
- Class-validator for validation
- JWT for authentication (future enhancement)

## Project Structure

```
url-shortener/
├── frontend/          # Next.js application
├── backend/           # NestJS application
├── package.json       # Root package.json with workspaces
└── README.md         # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd url-shortener
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
cd backend
npm run migration:run
```

4. Start the development servers:
```bash
npm run dev
```

This will start both the frontend (http://localhost:3000) and backend (http://localhost:3001) servers.

### Development

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications for production
- `npm start` - Start both applications in production mode

## API Endpoints

- `POST /api/urls` - Create a new short URL
- `GET /api/urls/:shortCode` - Get URL details
- `GET /:shortCode` - Redirect to original URL
- `GET /api/urls` - Get all URLs (with pagination)

## Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:./data.db
JWT_SECRET=your-secret-key
PORT=3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## License

MIT # ShortlyTeamManager
# ShortlyTeamManager
