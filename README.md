# Smart Dormitory Management System

Smart Dormitory Management System (SDMS) la do an quan ly ky tuc xa gom 2 phan:

- `sdms-backend`: Spring Boot API, authentication, business workflow, Flyway migration, notification, room, payment, registration, face, smart access.
- `sdms-frontend`: React + Vite admin web va public student portal.

## Tech Stack

- Backend: Java 17, Spring Boot 3, Spring Security, Spring Data JPA, PostgreSQL, Flyway, Swagger, Redis, Thymeleaf
- Frontend: React 18, TypeScript, Vite, Material UI, Axios, Vitest

## Main Features

- Public student flow: home page, dorm registration, application status, payment page, account activation
- Admin flow: login, dashboard, registration period management, application review, payment management, check-in, room management
- Extended modules: face approval, notification history, stay extension requests, checkout requests
- Infrastructure: JWT auth, upload integration, PDF generation, migration-based database versioning

## Project Structure

```text
smart-dormitory-management-system/
|- sdms-backend/
|  |- src/main/java/
|  |- src/main/resources/
|  |- .env.example
|  |- pom.xml
|  `- mvnw.cmd
|- sdms-frontend/
|  |- src/
|  |- public/
|  |- .env.example
|  `- package.json
`- README.md
```

## Prerequisites

- Java 17
- Node.js 18+ and npm
- PostgreSQL 14+

Optional:

- Redis
- Brevo account for email notifications
- Cloudinary account for upload storage

## Environment Variables

### Backend

Copy:

```bash
cp sdms-backend/.env.example sdms-backend/.env
```

Required variables are documented in [sdms-backend/.env.example](/D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/.env.example).

Main variables:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `APP_FRONTEND_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SERVER_PORT`

### Frontend

Copy:

```bash
cp sdms-frontend/.env.example sdms-frontend/.env
```

Main variable:

- `VITE_API_URL`

## Run Backend

### Option 1: Maven Wrapper

From [sdms-backend](/D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend):

```bash
./mvnw spring-boot:run
```

Windows:

```bash
mvnw.cmd spring-boot:run
```

### Option 2: Installed Maven

```bash
mvn spring-boot:run
```

Backend default URL:

- `http://localhost:8080`

Swagger UI:

- `http://localhost:8080/swagger-ui/index.html`

## Run Frontend

From [sdms-frontend](/D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-frontend):

```bash
npm install
npm run dev
```

If PowerShell blocks `npm`, use:

```bash
npm.cmd run dev
```

Frontend default URL:

- `http://localhost:5173`

## Build And Verify

### Frontend

```bash
npm run lint
npm run test
npm run build
```

### Backend

```bash
mvn test
```

Or with wrapper:

```bash
mvnw.cmd test
```

## Run With Docker Compose

From the repository root:

```bash
docker compose up --build
```

This starts:

- PostgreSQL on `localhost:5434`
- Backend API on `http://localhost:8080`
- Frontend web app on `http://localhost:5173`

To stop:

```bash
docker compose down
```

To remove database volume too:

```bash
docker compose down -v
```

Docker compose uses built-in development defaults:

- database: `sdms_db`
- database user: `postgres`
- database password: `postgres`
- backend DB host inside Docker network: `postgres:5432`

Optional overrides can be provided from the shell before running compose:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `APP_FRONTEND_URL`
- `VITE_API_URL`
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Development Mode With Hot Reload

Use this mode when you want live code changes for frontend and backend inside containers:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This development overlay changes:

- backend runs with `mvn spring-boot:run`
- frontend runs with Vite dev server on `0.0.0.0:5173`
- backend source is mounted into the container
- frontend source and `node_modules` are mounted for live reload

Development endpoints:

- frontend: `http://localhost:5173`
- backend: `http://localhost:8080`
- postgres: `localhost:5434`

To rebuild from scratch in dev mode:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

To stop dev mode:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

## Database And Seed Data

- Flyway migrations run on backend startup
- In non-production profile, backend auto-seeds default room data and an admin account if no admin exists

Seeded admin account from [DataSeeder.java](/D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/common/seeder/DataSeeder.java:62):

- Username: `admin`
- Email: `admin@sdms.com`
- Password: `admin123`

## Important Routes

### Public

- `/`
- `/register`
- `/status`
- `/payment/:applicationId`
- `/activate-account`

### Admin

- `/admin/login`
- `/admin`
- `/admin/registration-periods`
- `/admin/review`
- `/admin/applications/review`
- `/admin/faces/approve`
- `/admin/payments`
- `/admin/check-in`
- `/admin/rooms`
- `/admin/notifications`
- `/admin/extension-requests`
- `/admin/checkout-requests`

## Demo Checklist

1. Start PostgreSQL and create the target database.
2. Configure backend `.env`.
3. Start backend and confirm Flyway runs successfully.
4. Login with seeded admin account.
5. Start frontend and open `http://localhost:5173`.
6. Demo these flows:
   - public registration
   - admin review
   - payment/check-in
   - room dashboard
   - notifications
   - stay extension / checkout review

## Notes

- Do not commit real secrets in `.env` files.
- Rotate any exposed Brevo, JWT, Cloudinary, or database credentials before deploying outside local development.
- Log files are written under `sdms-backend/logs`.
- Docker setup files are available at [docker-compose.yml](/D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/docker-compose.yml), [docker-compose.dev.yml](/D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/docker-compose.dev.yml), [sdms-backend/Dockerfile](/D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/Dockerfile), and [sdms-frontend/Dockerfile](/D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-frontend/Dockerfile).
