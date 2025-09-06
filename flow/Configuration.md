# Configuration Page Architecture & Flow

## Overview
The Configuration page in ThingConnect.Pulse provides a comprehensive interface for managing YAML-based monitoring configurations. It supports real-time editing, validation, version history, and file management through a tabbed interface.

## Backend Architecture

### Controllers
- **ConfigurationController.cs** (`ThingConnect.Pulse.Server/Controllers/ConfigurationController.cs:9`)
  - Route: `/api/configuration`
  - Endpoints:
    - `POST /api/configuration/apply` - Apply YAML configuration
    - `GET /api/configuration/versions` - List all versions
    - `GET /api/configuration/versions/{id}` - Download specific version

### Services & Dependencies

#### ConfigurationService.cs (`ThingConnect.Pulse.Server/Services/ConfigurationService.cs:17`)
- **Interface**: `IConfigurationService`
- **Key Methods**:
  - `ApplyConfigurationAsync()` - Validates, processes, and saves configuration
  - `GetVersionsAsync()` - Retrieves version history
  - `GetVersionContentAsync()` - Gets specific version content
- **Dependencies**:
  - `PulseDbContext` - Database operations
  - `ConfigurationParser` - YAML parsing & validation
  - `IPathService` - File system paths

#### ConfigurationParser.cs (`ThingConnect.Pulse.Server/Services/ConfigurationParser.cs:9`)
- **Purpose**: YAML parsing and JSON schema validation
- **Key Features**:
  - Uses YamlDotNet for deserialization
  - JSON Schema validation against `config.schema.json`
  - Converts YAML to database entities (Groups, Endpoints)

### Data Models

#### DTOs (ConfigurationDtos.cs)
```csharp
// Version information
ConfigurationVersionDto {
    Id, AppliedTs, FileHash, FilePath, Actor, Note
}

// Apply operation result
ApplyResultDto {
    ConfigVersionId, Added, Updated, Removed, Warnings
}

// Validation error with structured location data
ValidationError {
    Path, Message, Value, Line?, Column?
}

// Validation errors collection
ValidationErrorsDto {
    Message, Errors[]
}

// YAML structure representation
ConfigurationYaml {
    Version, Defaults, Groups[], Targets[]
}
```

#### Database Entities
- **ConfigVersion**: Stores version metadata and file references
- **Group**: Hierarchical organization units
- **Endpoint**: Monitoring targets with configuration

## Frontend Architecture

### Main Page Component
**Configuration.tsx** (`thingconnect.pulse.client/src/pages/Configuration.tsx:9`)
- **Structure**: Tabbed interface using Chakra UI tabs
- **Tabs**:
  - YAML Editor (`ConfigurationEditor`)
  - Version History (`ConfigurationVersions`)
- **State Management**: Uses refresh trigger to coordinate between tabs

### Core Components

#### ConfigurationEditor.tsx (`thingconnect.pulse.client/src/components/config/ConfigurationEditor.tsx:21`)
**Features**:
- **Monaco Editor**: Live YAML editing with syntax highlighting, dark/light theme support
- **Inline Validation**: Real-time error markers directly in editor with tooltips
- **Structured Error Display**: Line/column positioning for precise error location
- File upload support (.yaml/.yml)
- Auto-load current configuration on component mount
- Compact validation feedback without redundant error details
- Configuration application with structured response handling

**Key Functions**:
- `handleFileUpload()` - Process uploaded YAML files
- `handleValidate()` - Validate without applying, shows inline Monaco markers
- `handleApply()` - Apply configuration to system
- `handleLoadCurrent()` - Load active configuration into editor
- `setValidationMarkers()` - Display validation errors directly in Monaco editor
- `findYamlPathPosition()` - Convert YAML paths to precise editor positions

#### ConfigurationVersions.tsx (`thingconnect.pulse.client/src/components/config/ConfigurationVersions.tsx:21`)
**Features**:
- Version history table with metadata
- Download functionality for any version
- Current version highlighting
- Timestamp formatting and hash display

**Key Functions**:
- `loadVersions()` - Fetch version list from API
- `handleDownload()` - Download specific version as YAML

### API Service Layer
**configuration.service.ts** (`thingconnect.pulse.client/src/api/services/configuration.service.ts:4`)
**Methods**:
- `getVersions()` - GET `/api/configuration/versions`
- `getVersion(id)` - GET `/api/configuration/versions/{id}`
- `downloadVersion(id)` - Download with automatic filename
- `applyConfiguration()` - POST `/api/configuration/apply`
- `getCurrentConfiguration()` - GET `/api/configuration/current`
- `validateConfiguration()` - POST `/api/configuration/apply?dryRun=true` (returns structured ValidationError[])

## Data Flow

### Configuration Apply Flow
```
Frontend (ConfigurationEditor)
    ↓ [YAML content]
ConfigurationService.applyConfiguration()
    ↓ [HTTP POST /api/configuration/apply]
ConfigurationController.ApplyAsync()
    ↓ [YAML string + headers]
ConfigurationService.ApplyConfigurationAsync()
    ↓ [Parse & validate]
ConfigurationParser.ParseAndValidateAsync()
    ↓ [Convert to entities]
ConfigurationService.ApplyChangesToDatabaseAsync()
    ↓ [Save to database + file system]
PulseDbContext + File.WriteAllTextAsync()
    ↓ [Return results]
ApplyResultDto → Frontend
```

### Version History Flow
```
Frontend (ConfigurationVersions)
    ↓ [Load versions]
ConfigurationService.getVersions()
    ↓ [HTTP GET /api/configuration/versions]
ConfigurationController.GetVersionsAsync()
    ↓ [Database query]
ConfigurationService.GetVersionsAsync()
    ↓ [Map to DTOs]
ConfigurationVersionDto[] → Frontend
```

### File Download Flow
```
Frontend (ConfigurationVersions)
    ↓ [Download button click]
ConfigurationService.downloadVersion(id)
    ↓ [HTTP GET /api/configuration/versions/{id}]
ConfigurationController.GetVersionAsync(id)
    ↓ [File system read]
ConfigurationService.GetVersionContentAsync(id)
    ↓ [Return YAML content]
Plain Text Response → Browser Download
```

## File System Storage

### Directory Structure
```
C:\ProgramData\ThingConnect.Pulse\
├── config.yaml                    # Active configuration
└── versions\                      # Version history
    ├── 20250102_143022_a1b2c3d4.yaml
    ├── 20250102_151545_e5f6g7h8.yaml
    └── ...
```

### Version Naming Convention
Format: `{yyyyMMdd_HHmmss}_{first8HashChars}.yaml`
- Timestamp: Human-readable apply time
- Hash: First 8 characters of SHA256 hash for uniqueness

## Key Features

### Validation System
- **Schema-based**: Uses JSON Schema validation
- **Monaco Integration**: Real-time error markers with precise line/column positioning
- **Structured Errors**: ValidationError objects with Line/Column properties for exact positioning
- **Dual Display**: Inline editor markers + compact summary alerts
- **Clean UI**: Removes redundant error details, directs users to highlighted editor lines
- **Dry-run**: Supports validation without application via `dryRun=true` parameter

### Version Management
- **Automatic**: Creates version on every apply
- **Hash-based deduplication**: Prevents duplicate configurations
- **Metadata tracking**: Records actor and notes
- **Download capability**: Any version can be retrieved

### State Management
- **React useState**: Local component state
- **Refresh triggers**: Coordinate between tabs
- **Error boundaries**: Comprehensive error handling
- **Loading states**: User feedback during operations

### Security & Reliability
- **Transaction-based**: Database operations are atomic
- **Hash verification**: Content integrity checking
- **File backup**: All versions preserved on disk
- **Error recovery**: Rollback on failures

## Integration Points

### Database Integration
- **Entity Framework Core**: ORM for data access
- **SQLite**: Local database storage
- **Migration support**: Schema versioning

### File System Integration
- **PathService**: Centralized path management
- **Atomic writes**: Ensures file consistency
- **Cleanup policies**: Future retention management

### UI Framework Integration
- **Chakra UI v3**: Component library with compact, aligned alerts
- **Monaco Editor**: Professional code editor with YAML syntax highlighting and dark/light theme
- **TypeScript**: Type safety throughout with ValidationError interfaces
- **React Hooks**: Modern state management
- **Responsive design**: Mobile-friendly interface

## Error Handling Strategy

### Backend Errors
- **Validation failures**: Return structured error details
- **File system errors**: Handle missing files gracefully
- **Database errors**: Transaction rollback and cleanup
- **Schema errors**: Loading and parsing error handling

### Frontend Errors
- **API failures**: User-friendly error messages  
- **File upload errors**: Format validation
- **Network errors**: Retry mechanisms
- **State errors**: Component error boundaries

This architecture provides a robust, user-friendly configuration management system with comprehensive version control, validation, and error handling capabilities.

## Missing Features Analysis & TODO

### ❌ Critical Missing Features

#### 1. Load Current/Active Configuration for Editing

**Problem**: Users cannot view or edit the currently active YAML configuration. The editor always starts empty.

**Missing Components**:
- Backend API endpoint: `GET /api/configuration/current`
- Frontend service method: `getCurrentConfiguration()`
- UI "Load Current" button in ConfigurationEditor

**Backend Changes Needed**:
```csharp
// Add to ConfigurationController.cs
[HttpGet("current")]
public async Task<ActionResult> GetCurrentAsync()

// Add to IConfigurationService & ConfigurationService  
Task<string?> GetCurrentConfigurationAsync();
```

**Frontend Changes Needed**:
```typescript
// Add to configuration.service.ts
async getCurrentConfiguration(): Promise<string>

// Add to ConfigurationEditor.tsx
const handleLoadCurrent = async () => { /* load current config */ }
```

#### 2. Auto-Load Current Configuration on Page Load

**Problem**: Configuration page opens with empty editor instead of showing active config.

**Solution**: Add useEffect to ConfigurationEditor.tsx to auto-load current configuration.

#### 3. Enhanced Version Management

**Missing**: 
- Load version directly into editor for modification
- Compare versions (diff view)
- Direct restore without download/upload cycle

**Current Limitation**: Can only download versions as files, no direct editor integration.

#### 4. Fix Validation API

**Problem**: Frontend calls `dry-run=true` parameter but backend doesn't support it.

**Solution**: Implement dry-run parameter in ConfigurationController.ApplyAsync()

#### 5. Real-time Configuration Status

**Missing**: No indication of when config was last applied or if editor matches active config.

**Solution**: Add status panel showing timestamps, hashes, and file system status.

## Implementation TODO List

### Phase 1 - Critical (P1) ✅ COMPLETED
- [x] **Backend**: Add `GET /api/configuration/current` endpoint
- [x] **Backend**: Implement `GetCurrentConfigurationAsync()` in ConfigurationService  
- [x] **Backend**: Add dry-run support to apply endpoint (dryRun parameter)
- [x] **Backend**: Implement structured ValidationError with Line/Column properties
- [x] **Frontend**: Add `getCurrentConfiguration()` to configuration.service.ts
- [x] **Frontend**: Add "Load Current" button to ConfigurationEditor
- [x] **Frontend**: Auto-load current config on page open
- [x] **Frontend**: Integrate Monaco Editor with YAML syntax highlighting
- [x] **Frontend**: Implement inline validation error markers in Monaco
- [x] **Frontend**: Compact, clean validation feedback UI

### Phase 2 - Important (P2)  
- [ ] **Frontend**: Add "Edit" button to version history table
- [ ] **Frontend**: Implement `onLoadIntoEditor` callback between components
- [ ] **Frontend**: Add configuration status panel
- [ ] **Frontend**: Show last applied timestamp and hash comparison
- [ ] **Backend**: Add endpoint for configuration metadata/status

### Phase 3 - Enhancement (P3)
- [ ] **Frontend**: Implement version comparison/diff view
- [ ] **Frontend**: Add direct version restore functionality  
- [ ] **Frontend**: Add unsaved changes warning
- [ ] **Frontend**: Improve error handling and user feedback
- [ ] **Backend**: Add configuration backup/restore utilities

### Key User Experience Gaps ✅ RESOLVED
1. ~~**Empty editor on load**~~ - ✅ Auto-loads current config on component mount
2. ~~**No current config access**~~ - ✅ Load Current button + getCurrentConfiguration() API
3. **Version isolation** - Versions exist separately from editor (P2 item)
4. ~~**Validation disconnect**~~ - ✅ Fixed dryRun parameter + structured ValidationError objects
5. **Status opacity** - Users can't see configuration state/health (P2 item)
6. ~~**Poor validation UX**~~ - ✅ Monaco inline markers + compact feedback UI

### Priority Impact
- **P1 items** ✅ COMPLETED - Solved core usability issues preventing effective daily use
- **P2 items** enhance workflow efficiency for power users  
- **P3 items** provide advanced features for complex scenarios

## Recent Implementation Summary (2025-09-02)

### Major Improvements Completed
1. **Monaco Editor Integration**: Replaced basic textarea with professional code editor
   - YAML syntax highlighting with theme support
   - Real-time inline validation markers with tooltips
   - Precise line/column error positioning

2. **Structured Validation System**: 
   - Backend ValidationError objects with Line/Column properties
   - Frontend handling of structured vs legacy string errors
   - Clean separation between YAML parsing errors (with exact positions) and schema errors (with path-based positioning)

3. **Enhanced API Support**:
   - GET /api/configuration/current endpoint implemented
   - dryRun parameter support for validation-only requests
   - Auto-load current configuration on page mount

4. **Improved User Experience**:
   - Compact, aligned validation alerts without redundant information
   - Removed unnecessary warning icons
   - Clean error display directing users to highlighted editor lines
   - Professional configuration management interface

The configuration system now provides a complete, user-friendly experience comparable to professional development tools, with all critical usability issues resolved.