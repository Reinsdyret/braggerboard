# Leaderboard

A customizable leaderboard app. Create a leaderboard, share its link, add participants
(with optional photos), and log rounds recording how many times each participant won.

-   Backend: Kotlin + Spring Boot 3 (JDK 21), `JdbcTemplate` (no ORM), Flyway migrations
-   Database: H2 file DB locally, Postgres in production (participant images stored as `bytea`)
-   Frontend: React 19 + Vite, built by Gradle and bundled into the Spring Boot jar as static
    resources - one deployable artifact, no separate frontend host
-   Deployment target: Heroku (`Procfile` + `system.properties` included)

Same stack/project shape as `bootcamp-techcase-aa`.

## How it works

-   `POST /api/leaderboards` creates a leaderboard and returns its UUID
-   Anyone with the link `/#/l/<uuid>` can view **and edit** the leaderboard - no accounts,
    no auth. Treat the link like a password: whoever has it can add participants and rounds.
-   A "round" is a batch of results: which participants won, and how many times each, in
    that round. Total standings are the sum of wins across all rounds.
-   Participant photos are uploaded as multipart form data and stored directly in Postgres
    as `bytea` (max 5MB, see `spring.servlet.multipart.max-file-size`).

## Prerequisites

1. **JDK 21** - `java -version`
2. **Node 22.x** and npm - `node --version` (only needed if you want to run the frontend
   dev server separately; Gradle will also install its own Node via the frontend plugin)
3. **Heroku CLI** - `heroku --version` ([install](https://devcenter.heroku.com/articles/heroku-cli))
4. A **Heroku account**, logged in locally: `heroku login`
5. **Git**

## Run it locally

Two terminals - one for the backend, one for the frontend dev server (hot reload):

```bash
./gradlew bootRun
```

Backend runs on `http://localhost:8081`, using a local H2 file database
(`leaderboard-db.mv.db`, gitignored).

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:8080` and proxies `/api` calls to the backend.
Open `http://localhost:8080/#/`.

To build the single deployable artifact (frontend gets bundled into the jar):

```bash
./gradlew build
java -jar build/libs/leaderboard-1.0.0.jar
```

## Deploying to your own Heroku app

```bash
git init
git add .
git commit -m "Initial commit"

heroku create your-leaderboard-app-name
heroku addons:create heroku-postgresql:essential-0 -a your-leaderboard-app-name
```

Check current Heroku Postgres plan names/pricing with `heroku addons:plans heroku-postgresql`
if `essential-0` isn't available - Heroku renames plans occasionally.

Heroku's Java buildpack auto-detects the Gradle project (via `gradlew` + `Procfile`) and
runs `./gradlew build` for you on push. The Postgres add-on's `DATABASE_URL` is
automatically translated by the buildpack into `JDBC_DATABASE_URL` /
`JDBC_DATABASE_USERNAME` / `JDBC_DATABASE_PASSWORD`, which `application-production.properties`
already reads - no manual config needed.

```bash
git push heroku main
heroku open
```

Useful commands:

-   Tail logs: `heroku logs --tail`
-   Run SQL against the Heroku DB: `heroku pg:psql`
-   Restart: `heroku restart`

## Project layout

```
src/main/kotlin/no/lars/leaderboard/
  App.kt                  - entry point
  config/DatabaseConfig.kt - JdbcTemplate beans
  domain/                 - data classes
  repository/             - JdbcTemplate-based repositories
  service/                - composes repositories (e.g. standings)
  web/                    - REST controllers
src/main/resources/db/migration/  - Flyway SQL migrations
frontend/src/                     - React app (HashRouter, so client routes like
                                     /#/l/<uuid> work without a server-side SPA fallback)
```
