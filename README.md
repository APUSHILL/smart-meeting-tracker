# Smart Meeting Tracker

A full-stack meeting management application with AI-powered features — built with Spring Boot, Angular 17, and Google Gemini AI.

## Features

- **Meeting Management** — Create, edit, and delete meetings with title, description, date/time, and attendees
- **Task Tracking** — Add tasks to meetings with priority (High/Medium/Low), deadlines, and status (Pending/Completed). Mark complete or undo back to pending
- **Notes** — Add and delete meeting notes
- **AI Meeting Summarizer** — Analyzes meeting notes and description to generate a summary and suggest action item tasks (powered by Gemini AI)
- **AI Smart Search** — Natural language search across all meetings, descriptions, and notes. Falls back to keyword search when AI quota is unavailable
- **JWT Authentication** — Secure login and registration with JWT tokens
- **Dashboard** — Overview of total meetings, pending/completed/overdue tasks with bar and pie charts
- **Responsive UI** — Angular Material design with upcoming/past meeting indicators, attendee chips, priority badges

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.2.4, Spring Security, JJWT |
| Database | MySQL 8, Spring Data JPA (Hibernate) |
| AI | Google Gemini API (gemini-2.5-flash) |
| Frontend | Angular 17, Angular Material, ng2-charts (Chart.js) |
| HTTP Client | Spring WebFlux WebClient (for Gemini calls) |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Angular 17 Frontend                   │
│                                                         │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌───────┐  │
│  │Dashboard │  │ Meetings  │  │ Meeting  │  │ Login │  │
│  │Component │  │   List    │  │ Details  │  │  Page │  │
│  └──────────┘  └───────────┘  └──────────┘  └───────┘  │
│        │             │              │                    │
│  ┌─────┴─────────────┴──────────────┴──────────────┐    │
│  │          Services (DI, providedIn: root)         │    │
│  │  MeetingService  TaskService  NoteService        │    │
│  │  AiService  DashboardService  AuthService        │    │
│  └──────────────────────┬──────────────────────────┘    │
│                         │ HttpClient + Auth Interceptor  │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTP / REST (JWT Bearer Token)
┌─────────────────────────┼───────────────────────────────┐
│              Spring Boot 3.2.4 Backend                  │
│                         │                               │
│  ┌──────────────────────▼──────────────────────────┐    │
│  │         JWT Auth Filter (OncePerRequestFilter)  │    │
│  └──────────────────────┬──────────────────────────┘    │
│                         │                               │
│  ┌──────────┐  ┌────────┴──┐  ┌──────────┐  ┌───────┐  │
│  │ Meeting  │  │   Task    │  │  Note    │  │  AI   │  │
│  │Controller│  │Controller │  │Controller│  │  +    │  │
│  └────┬─────┘  └─────┬─────┘  └─────┬────┘  │Search │  │
│       │              │               │       │  Ctrl │  │
│  ┌────▼─────┐  ┌─────▼─────┐  ┌─────▼────┐  └───┬───┘  │
│  │ Meeting  │  │   Task    │  │  Note    │      │      │
│  │ Service  │  │  Service  │  │  Service │  ┌───▼───┐   │
│  └────┬─────┘  └─────┬─────┘  └─────┬────┘  │AiSvc +│  │
│       │              │               │       │Search │  │
│  ┌────▼──────────────▼───────────────▼───────┤  Svc  │  │
│  │              Spring Data JPA              └───┬───┘  │
│  │   MeetingRepo  TaskRepo  NoteRepo  UserRepo   │      │
│  └───────────────────────┬───────────────────────┘      │
│                          │                    │          │
└──────────────────────────┼────────────────────┼─────────┘
                           │                    │
              ┌────────────▼────────┐  ┌────────▼──────────┐
              │   MySQL Database    │  │  Google Gemini API │
              │  meeting_tracker_db │  │  (gemini-2.5-flash)│
              └─────────────────────┘  └────────────────────┘
```

## Data Model

```
User
 └── (auth only, no ownership of meetings yet)

Meeting
 ├── id, title, description, meetingTime, attendees (CSV), createdAt
 ├── tasks[]  ──►  Task (id, title, deadline, status, priority, createdAt)
 └── notes[]  ──►  Note (id, content, createdAt)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/meetings` | List all meetings |
| POST | `/api/meetings` | Create meeting |
| GET | `/api/meetings/{id}` | Get meeting details |
| PUT | `/api/meetings/{id}` | Update meeting |
| DELETE | `/api/meetings/{id}` | Delete meeting |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/complete` | Mark task complete |
| PATCH | `/api/tasks/{id}/pending` | Undo task to pending |
| GET | `/api/tasks/meeting/{meetingId}` | Tasks for a meeting |
| GET | `/api/tasks/overdue` | All overdue tasks |
| GET | `/api/tasks/today` | Tasks due today |
| POST | `/api/notes` | Add note |
| GET | `/api/notes/meeting/{meetingId}` | Notes for a meeting |
| DELETE | `/api/notes/{id}` | Delete note |
| GET | `/api/dashboard` | Dashboard stats |
| POST | `/api/ai/analyze/{meetingId}` | AI summarize + suggest tasks |
| POST | `/api/search` | AI smart search |

All endpoints except `/api/auth/**` require `Authorization: Bearer <token>` header.

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8 running on port 3306
- A [Google Gemini API key](https://aistudio.google.com) (free tier)

### Backend Setup

```bash
cd backend

# Copy the template and fill in your values
cp src/main/resources/application.properties.template src/main/resources/application.properties
# Edit application.properties with your MySQL credentials, Gemini API key, and a JWT secret

mvn spring-boot:run
# Runs on http://localhost:8080
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:4200
```

Open `http://localhost:4200`, register an account, and start tracking meetings.

## Key Design Decisions

- **Attendees** stored as comma-separated TEXT in MySQL, converted to/from `List<String>` in `MeetingService`
- **Eager loading** of tasks and notes on `Meeting` entity so counts are available without extra queries
- **AI Search fallback** — if Gemini is unavailable or rate-limited, automatically falls back to keyword search across title, description, attendees, and notes
- **JWT stateless** — no server-side session; token validated on every request via `JwtAuthFilter`
- **Client-side filtering** — date range filter and overdue/today checks done in the browser
- Schema auto-migrated via `hibernate.ddl-auto=update` (no Flyway/Liquibase)
