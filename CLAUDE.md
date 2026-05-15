# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

```
meeting tracker/
├── backend/          # Spring Boot REST API (Java 17, Maven)
└── frontend/         # Angular 17 SPA (TypeScript, standalone components)
```

## Running the App

**Requires**: MySQL on port 3306. Credentials are in `backend/src/main/resources/application.properties`.

Start backend (terminal 1, from `backend/`):
```bash
mvn spring-boot:run        # runs on port 8080
```

Start frontend (terminal 2, from `frontend/`):
```bash
npm install                # first time only
npm start                  # runs on http://localhost:4200
```

If a port is busy: `lsof -ti:8080 | xargs kill -9`

## Backend Commands

```bash
mvn clean install          # full build
mvn package -DskipTests    # build JAR only
mvn test                   # run all tests
mvn test -Dtest=MyTest     # run single test
```

## Frontend Commands

```bash
npm run build      # production build
npm test           # Karma unit tests
```

## Architecture

### Backend

Spring Boot 3.2.4, Java 17. Layered: `Controller → Service → Repository`. Entities never exposed directly — all I/O goes through DTOs.

- **Entities** (`entity/`): `Meeting`, `Task`, `Note`. `Task` has `TaskStatus` enum (`PENDING`/`COMPLETED`) and `TaskPriority` enum (`LOW`/`MEDIUM`/`HIGH`). All `@OneToMany` from `Meeting` with cascade delete.
- **DTOs** (`dto/`): `*Request` (inbound) and `*Response` (outbound) per resource. `DashboardResponse` is an aggregate summary.
- **Exception handling** (`exception/GlobalExceptionHandler`): `@RestControllerAdvice` — 404 for `ResourceNotFoundException`, 400 for `MethodArgumentNotValidException` (returns `validationErrors` map of field→message), 500 for generic. All errors return `{ status, message, timestamp }`.
- **CORS** (`config/CorsConfig`): allows `http://localhost:4200` on all `/api/**` routes. Must be updated for production.

**API endpoints:**
- `GET/POST /api/meetings`, `GET/PUT/DELETE /api/meetings/{id}`
- `POST/PUT /api/tasks`, `PATCH /api/tasks/{id}/complete`
- `GET /api/tasks/meeting/{meetingId}`, `GET /api/tasks/overdue`, `GET /api/tasks/today`
- `POST /api/notes`, `GET /api/notes/meeting/{meetingId}`, `DELETE /api/notes/{id}`
- `GET /api/dashboard`

**Meeting.attendees** is stored as a comma-separated TEXT column and converted to/from `List<String>` in `MeetingService`.

**Overdue task definition**: `deadline < today AND status = PENDING`. Completed tasks are never overdue.

### Frontend

Angular 17 standalone components, lazy-loaded routes, no NgModules. Uses `@if`/`@for` (Angular 17 control flow syntax), not `*ngIf`/`*ngFor`.

- **Routes**: `/dashboard`, `/meetings`, `/meetings/new`, `/meetings/:id`
- **Services** (`services/`): `MeetingService`, `TaskService`, `NoteService`, `DashboardService` — all `providedIn: 'root'`, base URL from `environments/environment.ts`
- **Models** (`models/`): plain TypeScript interfaces matching backend DTOs. `TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'`

**Dashboard**: `ng2-charts` (Chart.js) bar + pie charts. If adding new chart types, register their controllers explicitly in `dashboard.component.ts` via `Chart.register()` — ng2-charts relies on manual registration to avoid tree-shaking.

**Meeting Details** (`meeting-details.component`):
- Loads meeting + tasks + notes in parallel with `forkJoin`
- Edit mode: toggled by Edit button, inline form with title/description/date+time/attendees, saves via `PUT /api/meetings/{id}`
- Task form includes priority dropdown (HIGH/MEDIUM/LOW), rendered as coloured dot + badge on each task card
- `isOverdue()` / `isToday()` / `isMeetingUpcoming()` computed client-side

**Meeting List** (`meeting-list.component`):
- Search bar filters by title (client-side, `filteredMeetings` getter)
- Date range dropdown: All time / This week / This month (matches `meetingTime`)

## Key Design Decisions

- `Meeting` eagerly loads `tasks` and `notes` so `taskCount`/`noteCount` are available in `MeetingService.toResponse()` without extra queries.
- `Task.priority` defaults to `MEDIUM` if not provided (enforced in both `TaskRequest` default value and a null-check in `TaskService`).
- Date handling: `LocalDate` for task deadlines, `LocalDateTime` for meeting timestamps. Frontend sends ISO strings.
- Attendees stored as comma-separated string in DB, always returned as `List<String>` from the API.
- Search and date filtering are done client-side (no backend query params needed at current scale).
- `hibernate.ddl-auto=update` — schema is auto-migrated on startup. No Flyway/Liquibase.
- No tests exist yet (`backend/src/test/` directory is empty).
