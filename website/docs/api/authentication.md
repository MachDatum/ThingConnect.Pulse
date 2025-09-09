---
sidebar_position: 2
---

# Authentication

Learn how to authenticate with the ThingConnect Pulse API for programmatic access.

## Authentication Methods

ThingConnect Pulse uses cookie-based authentication consistent with the web interface, ensuring a unified security model across all access methods.

### Cookie Authentication

#### Login Process

1. **POST Login Request**: Send credentials to the login endpoint
2. **Receive Session Cookie**: Server returns authentication cookie
3. **Include Cookie**: Send cookie with all subsequent requests
4. **Session Management**: Cookie expires based on session timeout

#### Login Endpoint

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

#### Successful Login Response

```http
HTTP/1.1 200 OK
Set-Cookie: .AspNetCore.Identity.Application=...; HttpOnly; Secure; SameSite=Strict
Content-Type: application/json

{
  "success": true,
  "user": {
    "id": "user-123",
    "username": "admin",
    "email": "admin@company.com",
    "roles": ["Administrator"]
  }
}
```

#### Using the Session Cookie

```http
GET /api/status/live
Cookie: .AspNetCore.Identity.Application=...
```

## API Key Authentication

### Personal API Keys

Users can generate personal API keys for programmatic access:

#### Generating API Keys

1. **Login to Web Interface**: Access your user profile
2. **Navigate to API Keys**: Find API key management section
3. **Generate New Key**: Create a new API key with description
4. **Copy Key**: Securely store the generated key

#### API Key Usage

```http
GET /api/status/live
Authorization: Bearer your-api-key-here
```

#### API Key Management

- **Multiple Keys**: Users can have multiple API keys for different purposes
- **Key Descriptions**: Add descriptions to identify key usage
- **Expiration Dates**: Set optional expiration for keys
- **Revocation**: Immediately revoke compromised keys

## Authentication Examples

### cURL Examples

#### Login and Use Session

```bash
# Login and save cookies
curl -c cookies.txt -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  http://localhost:8080/api/auth/login

# Use session for API calls
curl -b cookies.txt \
  http://localhost:8080/api/status/live
```

#### API Key Authentication

```bash
curl -H "Authorization: Bearer your-api-key" \
  http://localhost:8080/api/status/live
```

### JavaScript/Node.js Examples

#### Using fetch() with Session Cookies

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies
  body: JSON.stringify({
    username: 'admin',
    password: 'password'
  })
});

// Subsequent requests automatically include cookies
const statusResponse = await fetch('/api/status/live', {
  credentials: 'include'
});
const status = await statusResponse.json();
```

#### Using API Key

```javascript
const response = await fetch('/api/status/live', {
  headers: {
    'Authorization': 'Bearer your-api-key-here'
  }
});
```

### PowerShell Examples

#### Session-Based Authentication

```powershell
# Login and create session
$loginBody = @{
    username = "admin"
    password = "password"
} | ConvertTo-Json

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
  -Method POST -Body $loginBody -ContentType "application/json" `
  -WebSession $session

# Use session for subsequent requests
$status = Invoke-RestMethod -Uri "http://localhost:8080/api/status/live" `
  -WebSession $session
```

#### API Key Authentication

```powershell
$headers = @{
    Authorization = "Bearer your-api-key-here"
}

$status = Invoke-RestMethod -Uri "http://localhost:8080/api/status/live" `
  -Headers $headers
```

## Security Considerations

### Session Security

#### Cookie Security Features
- **HttpOnly**: Prevents client-side JavaScript access
- **Secure**: Only transmitted over HTTPS in production
- **SameSite**: Protection against CSRF attacks
- **Domain Binding**: Cookies bound to specific domain

#### Session Management
- **Timeout**: Sessions expire after inactivity period
- **Concurrent Sessions**: Control multiple simultaneous sessions
- **Logout**: Proper session invalidation on logout
- **Server-Side Storage**: Session data stored server-side

### API Key Security

#### Key Management Best Practices
- **Secure Storage**: Store API keys securely (environment variables, key vaults)
- **Rotation**: Regular API key rotation
- **Minimal Scope**: Use role-based permissions for API keys
- **Monitoring**: Track API key usage and unusual activity

#### Protection Measures
- **Rate Limiting**: API keys subject to rate limiting
- **IP Restrictions**: Optional IP address restrictions for keys
- **Audit Logging**: All API key usage logged
- **Immediate Revocation**: Quick response to compromised keys

## Error Handling

### Authentication Errors

#### Common Error Responses

**Invalid Credentials**
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid username or password"
  }
}
```

**Session Expired**
```json
{
  "error": {
    "code": "SESSION_EXPIRED",
    "message": "Session has expired, please login again"
  }
}
```

**Invalid API Key**
```json
{
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is invalid or expired"
  }
}
```

#### HTTP Status Codes
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Authenticated but insufficient permissions
- **429 Too Many Requests**: Rate limit exceeded

## Best Practices

### Authentication Strategy
- **Use HTTPS**: Always use secure connections in production
- **Secure Storage**: Never store credentials in code or version control
- **Environment Variables**: Use environment variables for credentials
- **Key Rotation**: Regular rotation of API keys and passwords

### Error Handling
- **Graceful Degradation**: Handle authentication failures gracefully
- **Retry Logic**: Implement appropriate retry strategies
- **Logging**: Log authentication events for security monitoring
- **User Feedback**: Provide clear error messages to users

### Integration Guidelines
- **Session Reuse**: Reuse sessions when possible to reduce login overhead
- **Connection Pooling**: Use connection pooling for better performance
- **Caching**: Cache authentication tokens appropriately
- **Monitoring**: Monitor authentication success/failure rates