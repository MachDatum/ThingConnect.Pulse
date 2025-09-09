---
sidebar_position: 5
---

# User Management

Manage user accounts, permissions, and access control for your ThingConnect Pulse deployment.

## User Accounts

### Creating User Accounts

Navigate to **Users** in the sidebar to manage user accounts:

1. **Add New User**: Click "Add User" button
2. **User Information**: Enter username, email, and full name
3. **Set Password**: Assign initial password (user can change on first login)
4. **Assign Role**: Choose appropriate role for the user
5. **Save**: Create the user account

### User Roles and Permissions

#### Administrator
- **Full System Access**: Complete control over all features
- **User Management**: Create, modify, and delete user accounts
- **System Configuration**: Modify system settings and configuration
- **Endpoint Management**: Full endpoint configuration and monitoring
- **Data Access**: View all monitoring data and history

#### Operator
- **Monitoring Control**: Manage endpoints and monitoring settings
- **Configuration Access**: Modify endpoint configurations
- **Alert Management**: Manage alerts and notifications
- **Limited User Access**: Cannot create or delete users
- **Full Data Access**: View all monitoring data

#### Viewer
- **Read-Only Access**: View dashboards and monitoring data
- **No Configuration**: Cannot modify settings or endpoints
- **Limited History**: Access to historical data only
- **No User Management**: Cannot access user settings
- **Basic Alerts**: View alert notifications only

### Account Management

#### Password Management
- **Password Requirements**: Enforced complexity rules
- **Password Expiration**: Optional password aging policies
- **Password Reset**: Self-service and admin-initiated resets
- **Account Lockout**: Protection against brute force attacks

#### Profile Settings
- **Personal Information**: Name, email, and contact details
- **Notification Preferences**: Alert delivery preferences
- **Interface Settings**: Theme, language, and display options
- **API Access**: Personal API keys for programmatic access

## Access Control

### Endpoint-Level Permissions

#### Endpoint Groups
- **Create Groups**: Organize endpoints by function or location
- **Assign Users**: Grant access to specific endpoint groups
- **Permission Levels**: View-only or full control permissions
- **Inheritance**: Group permissions inherit to child endpoints

#### Individual Endpoint Access
- **Specific Permissions**: Grant access to individual endpoints
- **Action Controls**: Limit specific actions (view, edit, delete)
- **Override Groups**: Individual permissions override group settings
- **Temporary Access**: Time-limited permissions for specific endpoints

### Feature-Level Permissions

#### Administrative Features
- **System Settings**: Access to global configuration
- **User Management**: Ability to manage other user accounts
- **Backup/Restore**: System backup and restore operations
- **Log Access**: System log viewing and analysis

#### Operational Features
- **Dashboard Access**: Main monitoring dashboard visibility
- **History Access**: Historical data viewing permissions
- **Report Generation**: Ability to create and export reports
- **Alert Configuration**: Alert rule and channel management

## Authentication Options

### Local Authentication

#### Built-in User Database
- **Local Storage**: Users stored in ThingConnect Pulse database
- **Password Hashing**: Secure bcrypt password storage
- **Session Management**: Cookie-based session handling
- **Account Recovery**: Password reset via email

#### Two-Factor Authentication
- **TOTP Support**: Time-based one-time passwords (Google Authenticator, Authy)
- **Backup Codes**: Recovery codes for device loss
- **Forced 2FA**: Require 2FA for specific roles
- **QR Code Setup**: Easy 2FA setup with QR codes

### External Authentication

#### Active Directory Integration
- **Domain Authentication**: Windows domain user authentication
- **Group Mapping**: Map AD groups to ThingConnect Pulse roles
- **Single Sign-On**: Seamless authentication for domain users
- **User Synchronization**: Automatic user provisioning

#### LDAP Integration
- **LDAP Binding**: Authenticate against LDAP directories
- **Attribute Mapping**: Map LDAP attributes to user properties
- **Group Membership**: Role assignment based on LDAP groups
- **Connection Security**: Secure LDAP over SSL/TLS

## Security Features

### Session Management

#### Session Security
- **Secure Cookies**: HttpOnly and Secure cookie flags
- **Session Timeout**: Automatic logout after inactivity
- **Concurrent Sessions**: Control simultaneous login limits
- **Session Invalidation**: Logout all sessions when needed

#### Login Security
- **Account Lockout**: Temporary lockout after failed attempts
- **Rate Limiting**: Prevent brute force authentication attacks
- **Login Auditing**: Log all authentication attempts
- **Suspicious Activity**: Alert on unusual login patterns

### Audit Logging

#### User Activity Tracking
- **Login Events**: Track all login and logout events
- **Configuration Changes**: Log all user-initiated changes
- **Data Access**: Track sensitive data access
- **Permission Changes**: Audit role and permission modifications

#### Compliance Features
- **Audit Reports**: Generate compliance audit reports
- **Data Retention**: Configurable audit log retention
- **Export Capabilities**: Export audit logs for external analysis
- **Integrity Protection**: Tamper-proof audit log storage

## User Administration

### Bulk User Management

#### User Import
- **CSV Import**: Bulk user creation from spreadsheet data
- **Validation**: Verify user data before import
- **Role Assignment**: Batch role assignment during import
- **Error Handling**: Report and resolve import errors

#### Mass Operations
- **Bulk Role Changes**: Change multiple user roles simultaneously
- **Password Reset**: Force password reset for multiple users
- **Account Status**: Enable/disable multiple accounts
- **Permission Updates**: Batch permission modifications

### Self-Service Features

#### User Profile Management
- **Profile Updates**: Users can update their own information
- **Password Changes**: Self-service password updates
- **Notification Settings**: Personal alert preferences
- **API Key Management**: Self-managed API access tokens

#### Account Recovery
- **Forgot Password**: Email-based password reset
- **Account Unlock**: Self-service account unlock options
- **2FA Recovery**: Backup code and recovery options
- **Contact Administrator**: Help request functionality

## Best Practices

### Security Guidelines
- **Principle of Least Privilege**: Grant minimum necessary permissions
- **Regular Access Review**: Periodic permission audits
- **Strong Authentication**: Enforce strong passwords and 2FA
- **Session Management**: Appropriate timeout and security settings

### User Experience
- **Role-Based Interface**: Show relevant features based on user role
- **Clear Permissions**: Make user capabilities obvious in the interface
- **Help and Documentation**: Provide role-specific help content
- **Onboarding**: Smooth new user introduction process

### Compliance and Governance
- **Access Documentation**: Maintain records of access decisions
- **Change Approval**: Approval process for permission changes
- **Regular Training**: Security awareness for all users
- **Incident Response**: Process for handling security incidents