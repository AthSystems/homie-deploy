# Homie Deploy

Deployment repository for Homie personal finance application.

## Structure

```
homie-deploy/
├── backend/
│   ├── Dockerfile      # Backend container image
│   ├── app.jar         # Pre-built Spring Boot application
│   └── data/           # Categorization rules and config
├── frontend/
│   ├── Dockerfile      # Frontend container image
│   └── (source)        # Next.js application source
├── docker-compose.yml  # Service orchestration
└── .env.template       # Environment variables template
```

## Deployment

### Prerequisites
- Docker and Docker Compose
- External PostgreSQL database
- `homie` Docker network created
- ZFS storage at `/srv/nas/docker/homie/`

### Deploy with Portainer

1. Create stack from this repository
2. Configure environment variables from `.env.template`
3. Deploy

### Deploy with CLI

```bash
# Copy and configure environment
cp .env.template .env
# Edit .env with your values

# Deploy
docker-compose up -d
```

## Updating

1. Build new JAR in main repo: `./gradlew bootJar`
2. Copy JAR to `backend/app.jar`
3. Copy updated frontend source
4. Commit and push
5. In Portainer: Pull and redeploy

## Ports

- Frontend: 11010 (configurable via FRONTEND_PORT)
- Backend API: 15010 (configurable via BACKEND_PORT)
