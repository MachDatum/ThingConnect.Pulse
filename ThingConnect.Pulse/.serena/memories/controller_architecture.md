# Controller Architecture and API Endpoints

## Controllers Found
The ASP.NET Core application uses traditional MVC controllers with the following structure:

### 1. StatusController (`/api/status`)
- **Purpose**: Live monitoring status feed
- **Authorization**: Requires authentication
- **Key Endpoint**: 
  - `GET /api/status/live` - Get paged live status for all endpoints with optional group/search filters

### 2. ConfigurationController (`/api/configuration`) 
- **Purpose**: YAML configuration management
- **Authorization**: Mixed (some endpoints require admin role)
- **Key Endpoints**:
  - `POST /api/configuration/apply` - Apply YAML configuration (admin only)
  - `GET /api/configuration/versions` - List configuration versions (authenticated)
  - `GET /api/configuration/versions/{id}` - Download specific version (authenticated)
  - `GET /api/configuration/current` - Get current active configuration (authenticated)

### 3. HistoryController (`/api/history`)
- **Purpose**: Historical monitoring data
- **Authorization**: Requires authentication
- **Key Endpoint**:
  - `GET /api/history/endpoint/{id}` - Get historical data for specific endpoint with date range and bucket type (raw/15m/daily)

### 4. AuthController (`/api/auth`)
- **Purpose**: Authentication and user session management
- **Authorization**: Mixed (some public for login/register)
- **Key Endpoints**:
  - `POST /api/auth/login` - User login with cookie authentication
  - `POST /api/auth/register` - Initial admin registration (only if no users exist)
  - `GET /api/auth/setup-required` - Check if initial setup is needed
  - `GET /api/auth/session` - Get current user session info (authenticated)
  - `POST /api/auth/change-password` - Change own password (authenticated)
  - `POST /api/auth/logout` - Logout (authenticated)

### 5. UserManagementController (`/api/usermanagement`)
- **Purpose**: User administration
- **Authorization**: Admin role required
- **Key Endpoints**:
  - `GET /api/usermanagement` - List users with pagination/filtering
  - `GET /api/usermanagement/{id}` - Get user by ID
  - `POST /api/usermanagement` - Create new user
  - `PUT /api/usermanagement/{id}` - Update user details
  - `PUT /api/usermanagement/{id}/role` - Change user role
  - `POST /api/usermanagement/{id}/reset-password` - Admin password reset
  - `DELETE /api/usermanagement/{id}` - Soft delete user (deactivate)

## Architecture Patterns
- All controllers inherit from `ControllerBase`
- Consistent use of `[ApiController]` and `[Route("api/[controller]")]` attributes
- Proper dependency injection with constructor injection
- Comprehensive error handling with structured logging
- Role-based authorization using ASP.NET Core Identity
- Cookie-based authentication for session management
- Proper HTTP status codes and response DTOs