# WaitLess - Gestion RDV & File d'attente

## Overview

Plateforme de gestion de rendez-vous et file d'attente en temps réel pour la Tunisie.
Cible : médecins, laboratoires, radios, administrations, cabinets paramédicaux.

## Architecture

- **Backend**: Java Spring Boot 3.2.5 (Maven) avec PostgreSQL + Hibernate/JPA
- **Frontend**: React + Vite + TailwindCSS
- **Monorepo**: pnpm workspaces (Node.js/TypeScript pour tooling)

## Stack

### Backend (Spring Boot)
- Java 19 (GraalVM 22.3)
- Spring Boot 3.2.5
- Spring Data JPA + Hibernate 6
- PostgreSQL (Replit built-in)
- Lombok
- SpringDoc OpenAPI (Swagger UI à `/api/swagger-ui.html`)
- Port: 8080, context path: `/api`

### Frontend (React)
- React 18 + Vite
- TailwindCSS
- Framer Motion (animations)
- Lucide React (icônes)
- React Query (hooks API générés)
- Port: 23449, base path: `/`

## Structure

```
artifacts/
├── api-server/          # Artifact config (pointe vers spring-api)
├── spring-api/          # Code source Java Spring Boot
│   ├── pom.xml
│   └── src/main/java/com/waitless/
│       ├── model/       # Entités JPA (Organization, ServiceDept, Resource, Appointment, QueueTicket)
│       ├── repository/  # Spring Data JPA repositories
│       ├── service/     # Logique métier
│       ├── controller/  # REST controllers
│       ├── dto/         # Data Transfer Objects
│       └── config/      # CORS config
└── rdv-app/             # Frontend React
    └── src/
        ├── pages/       # Dashboard, Organizations, Appointments, Queue, CallScreen
        ├── components/  # UI components + Layout
        └── lib/         # Utils
lib/
├── api-spec/openapi.yaml  # OpenAPI spec (source of truth)
├── api-client-react/      # React Query hooks générés
└── api-zod/               # Zod schemas générés
```

## Domain Entities

- **Organization**: clinique, labo, radio, dentiste, paramédical, administration
- **ServiceDept**: département/service au sein d'une organisation
- **Resource**: machine, praticien, guichet, salle
- **Appointment**: rendez-vous avec statut (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
- **QueueTicket**: ticket file d'attente avec priorité (NORMAL, URGENT, PREGNANT, ELDERLY, DISABLED)

## API Endpoints

- `GET/POST /api/organizations` - Gestion des organisations
- `GET/POST /api/organizations/{id}/services` - Services d'une organisation
- `GET/POST /api/appointments` - Rendez-vous (filtrés par service + date)
- `GET/POST /api/queue/{serviceDeptId}` - File d'attente temps réel
- `POST /api/queue/join` - Rejoindre la file
- `POST /api/queue/{serviceDeptId}/call-next` - Appeler le suivant
- `GET /api/dashboard/stats` - Statistiques globales

## Running Commands

### Backend Spring Boot
```bash
cd artifacts/spring-api && mvn spring-boot:run
# Or via workflow: "artifacts/api-server: API Server"
```

### Frontend React
```bash
pnpm --filter @workspace/rdv-app run dev
# Or via workflow: "artifacts/rdv-app: web"
```

### Codegen (OpenAPI → React hooks + Zod schemas)
```bash
pnpm --filter @workspace/api-spec run codegen
```

## Business Model
- Abonnement mensuel: 20–50 TND
- Version gratuite limitée
- Contrats annuels pour grandes structures
