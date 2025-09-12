# ThingConnect.Pulse - Complete Architecture Diagram

## High-Level System Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[React Frontend<br/>Chakra UI]
    end
    
    subgraph "API Layer"
        API[REST API<br/>ASP.NET Core]
    end
    
    subgraph "Backend Layer"
        BE[Business Services<br/>Background Services]
    end
    
    subgraph "Data Layer"
        DB[(SQLite Database<br/>EF Core)]
    end
    
    subgraph "External"
        NET[Network Targets<br/>ICMP/TCP/HTTP]
        SENTRY[Sentry.io]
        MIXPANEL[Mixpanel]
    end
    
    FE <-->|HTTP/JSON| API
    API <--> BE
    BE <--> DB
    BE -->|Probes| NET
    BE -->|Errors| SENTRY
    FE -->|Analytics| MIXPANEL
```

## Frontend Architecture

```mermaid
graph TB
    subgraph "Pages Layer"
        Dashboard[Dashboard]
        History[History]
        Configuration[Configuration]
        Settings[Settings]
        Auth[Login/Onboarding]
    end
    
    subgraph "Components Layer"
        StatusTable[StatusTable]
        AvailabilityChart[AvailabilityChart]
        ConfigEditor[ConfigurationEditor]
        Navigation[Navigation]
    end
    
    subgraph "Service Layer"
        StatusService[StatusService]
        HistoryService[HistoryService]
        ConfigService[ConfigurationService]
        AuthService[AuthService]
        ApiClient[ApiClient]
    end
    
    subgraph "State Management"
        useStatusQuery[useStatusQuery]
        AuthContext[AuthContext]
        Analytics[Analytics]
    end
    
    Dashboard --> StatusTable
    Dashboard --> useStatusQuery
    History --> AvailabilityChart
    Configuration --> ConfigEditor
    
    StatusTable --> StatusService
    AvailabilityChart --> HistoryService
    ConfigEditor --> ConfigService
    Auth --> AuthService
    
    StatusService --> ApiClient
    HistoryService --> ApiClient
    ConfigService --> ApiClient
    AuthService --> ApiClient
    
    useStatusQuery --> StatusService
    Navigation --> AuthContext
    AuthContext --> AuthService
```

## Backend Architecture

```mermaid
graph TB
    subgraph "Controllers"
        AuthController[AuthController]
        StatusController[StatusController]
        ConfigController[ConfigurationController]
        HistoryController[HistoryController]
        UserController[UserManagementController]
    end
    
    subgraph "Business Services"
        ConfigServiceBE[ConfigurationService]
        StatusServiceBE[StatusService]
        HistoryServiceBE[HistoryService]
        ProbeService[ProbeService]
        OutageDetection[OutageDetectionService]
    end
    
    subgraph "Background Services"
        MonitoringBG[MonitoringBackgroundService]
        RollupBG[RollupBackgroundService]
        LogCleanup[LogCleanupBackgroundService]
    end
    
    subgraph "Data Services"
        RollupService[RollupService]
        PruneService[PruneService]
        SettingsService[SettingsService]
    end
    
    subgraph "Infrastructure"
        SentryService[ConsentAwareSentryService]
        ConfigParser[ConfigurationParser]
        DbContext[PulseDbContext]
    end
    
    AuthController --> SettingsService
    StatusController --> StatusServiceBE
    ConfigController --> ConfigServiceBE
    HistoryController --> HistoryServiceBE
    UserController --> DbContext
    
    StatusServiceBE --> OutageDetection
    ConfigServiceBE --> ConfigParser
    
    MonitoringBG --> ProbeService
    MonitoringBG --> OutageDetection
    RollupBG --> RollupService
    
    ProbeService --> DbContext
    OutageDetection --> DbContext
    RollupService --> DbContext
    PruneService --> DbContext
    SettingsService --> DbContext
```

## Data Model Architecture

```mermaid
erDiagram
    Group {
        string Id PK
        string Name
        string ParentId FK
        string Color
        int SortOrder
    }
    
    Endpoint {
        guid Id PK
        string Name
        string GroupId FK
        enum Type
        string Host
        int Port
        string HttpPath
        string HttpMatch
        int IntervalSeconds
        int TimeoutMs
        bool Enabled
    }
    
    CheckResultRaw {
        long Id PK
        guid EndpointId FK
        datetime Ts
        enum Status
        double RttMs
        string Error
    }
    
    Outage {
        long Id PK
        guid EndpointId FK
        datetime StartedTs
        datetime EndedTs
        int DurationSeconds
        string LastError
    }
    
    Rollup15m {
        guid EndpointId PK,FK
        datetime BucketTs PK
        double UpPct
        double AvgRttMs
        int DownEvents
    }
    
    RollupDaily {
        guid EndpointId PK,FK
        date BucketDate PK
        double UpPct
        double AvgRttMs
        int DownEvents
    }
    
    ApplicationUser {
        string Id PK
        string Username
        string Email
        string Role
        datetime CreatedAt
        datetime LastLoginAt
        bool IsActive
    }
    
    Group ||--o{ Endpoint : contains
    Endpoint ||--o{ CheckResultRaw : monitors
    Endpoint ||--o{ Outage : experiences
    Endpoint ||--o{ Rollup15m : aggregates
    Endpoint ||--o{ RollupDaily : summarizes
```

## API Relationship Matrix

```mermaid
graph LR
    subgraph "Frontend Services → Backend APIs"
        FS1[StatusService] -->|GET /api/status/live| API1[StatusController]
        FS2[HistoryService] -->|GET /api/history/endpoint/ID| API2[HistoryController]
        FS3[ConfigurationService] -->|GET/POST /api/configuration/*| API3[ConfigurationController]
        FS4[AuthService] -->|POST /api/auth/*| API4[AuthController]
        FS5[UserManagement] -->|CRUD /api/usermanagement/*| API5[UserManagementController]
    end
```

### API Endpoints Detail

| Frontend Service | HTTP Method | Endpoint | Backend Controller | Purpose |
|-----------------|-------------|----------|-------------------|---------|
| StatusService | GET | `/api/status/live` | StatusController | Real-time endpoint status |
| HistoryService | GET | `/api/history/endpoint/{id}` | HistoryController | Historical data retrieval |
| ConfigurationService | GET | `/api/configuration/versions` | ConfigurationController | List config versions |
| ConfigurationService | GET | `/api/configuration/current` | ConfigurationController | Get current config |
| ConfigurationService | POST | `/api/configuration/apply` | ConfigurationController | Apply new config |
| AuthService | POST | `/api/auth/login` | AuthController | User authentication |
| AuthService | POST | `/api/auth/register` | AuthController | Initial user setup |
| AuthService | GET | `/api/auth/session` | AuthController | Session validation |
| AuthService | POST | `/api/auth/logout` | AuthController | User logout |
| UserManagement | GET | `/api/usermanagement/` | UserManagementController | List users |
| UserManagement | POST | `/api/usermanagement/` | UserManagementController | Create user |
| UserManagement | PUT | `/api/usermanagement/{id}` | UserManagementController | Update user |

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant API as API Layer
    participant S as Services
    participant BG as Background
    participant DB as Database
    participant N as Network
    
    Note over U,N: Live Monitoring Flow
    U->>F: Access Dashboard
    F->>API: GET /api/status/live
    API->>S: StatusService.GetLive()
    S->>DB: Query latest status
    DB-->>S: Return endpoint data
    S-->>API: PagedLive response
    API-->>F: JSON response
    F-->>U: Real-time dashboard
    
    Note over BG,N: Background Monitoring
    loop Every Interval
        BG->>N: ICMP/TCP/HTTP Probe
        N-->>BG: Response/Timeout
        BG->>DB: Store CheckResult
        BG->>S: Update OutageDetection
        S->>DB: Store/Update Outage
    end
    
    Note over U,DB: Configuration Flow
    U->>F: Upload YAML Config
    F->>API: POST /api/configuration/apply
    API->>S: ConfigurationService.Apply()
    S->>S: Parse & Validate YAML
    S->>DB: Update Groups & Endpoints
    S->>DB: Store ConfigVersion
    S-->>API: Success/Validation Errors
    API-->>F: Response
    F-->>U: Confirmation/Errors
```

## Component Dependency Tree

```mermaid
graph TD
    %% Frontend Dependencies
    App[App.tsx] --> Router[Router]
    App --> AuthContext
    App --> QueryProvider[TanStack Query Provider]
    
    Router --> Dashboard
    Router --> History  
    Router --> Configuration
    Router --> Settings
    Router --> Login
    
    Dashboard --> StatusTable
    Dashboard --> StatusFilters
    Dashboard --> useStatusQuery
    
    StatusTable --> StatusService
    StatusTable --> useAnalytics
    
    History --> HistoryTable
    History --> HistoryService
    History --> DateRangePicker
    
    Configuration --> ConfigEditor
    Configuration --> ConfigService
    Configuration --> useAnalytics
    
    %% Backend Dependencies
    Program[Program.cs] --> Controllers
    Program --> Services
    Program --> BackgroundServices
    Program --> DbContext
    Program --> Identity
    
    Controllers --> BusinessServices
    BusinessServices --> DataServices
    BusinessServices --> DbContext
    BackgroundServices --> BusinessServices
    BackgroundServices --> NetworkServices
    
    %% Data Dependencies
    DbContext --> Entities
    Entities --> SQLiteDB
```

## Key Architectural Patterns Summary

1. **Frontend Patterns:**
   - Component Composition with Chakra UI
   - Custom Hooks for business logic
   - Service Layer for API abstraction
   - TanStack Query for server state
   - Context API for authentication

2. **Backend Patterns:**
   - Controller → Service → Repository (EF Core)
   - Dependency Injection throughout
   - Background Services for long-running tasks
   - Configuration-driven external settings

3. **API Patterns:**
   - RESTful endpoints with proper HTTP verbs
   - Cookie-based authentication
   - JSON request/response with text/plain for YAML
   - Proper error handling and validation

4. **Data Patterns:**
   - Code-first EF Core with migrations
   - Time-series data with rollup aggregation
   - Hierarchical grouping with foreign keys
   - Soft delete patterns for users

5. **Integration Patterns:**
   - Polling-based real-time updates (5s intervals)
   - Client-side CSV generation
   - Consent-aware external service integration
   - Network probing with configurable retry logic