; ThingConnect Pulse - Inno Setup Installation Script
; Implements installer conventions documented in docs/installer-map.md

#define AppName "ThingConnect Pulse"
#define AppVersion "1.0.0"
#define AppPublisher "MachDatum"
#define AppURL "https://github.com/MachDatum/ThingConnect.Pulse"
#define AppExeName "ThingConnect.Pulse.Server.exe"
#define ServiceName "ThingConnectPulseSvc"
#define ServiceDisplayName "ThingConnect Pulse Server"
#define ServiceDescription "Network availability monitoring system for manufacturing sites"

[Setup]
AppId={{B8E8F8A0-8B8A-4B8A-8B8A-8B8A8B8A8B8A}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}/issues
AppUpdatesURL={#AppURL}/releases
DefaultDirName={autopf}\ThingConnect.Pulse
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
OutputDir=installer
OutputBaseFilename=ThingConnect.Pulse.Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
DisableDirPage=no
DisableReadyPage=no

; Windows version requirements
MinVersion=10.0.17763
ArchitecturesAllowed=x64

; Enable installation logging
SetupLogging=yes

; Icon configuration
; SetupIconFile=thingconnect-logo.ico
; UninstallDisplayIcon={app}\thingconnect-logo.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
; Application binaries from publish output
Source: "publish\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; Include ThingConnect logo icon (commented out - file missing)
; Source: "thingconnect-logo.ico"; DestDir: "{app}"; Flags: ignoreversion
; Include manual service installation script for troubleshooting
Source: "install-service.ps1"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#AppName}"; Filename: "http://localhost:8090"
Name: "{group}\Configuration"; Filename: "{commonappdata}\ThingConnect.Pulse\config\config.yaml"
Name: "{group}\Logs Directory"; Filename: "{commonappdata}\ThingConnect.Pulse\logs"
Name: "{group}\Installation Log"; Filename: "{log}"
Name: "{group}\Manual Service Install"; Filename: "{app}\install-service.ps1"; Comment: "Run if service installation fails"
Name: "{group}\{cm:UninstallProgram,{#AppName}}"; Filename: "{uninstallexe}"

[Run]
; Install and start the Windows service
Filename: "{sys}\sc.exe"; Parameters: "create ""{#ServiceName}"" start= auto DisplayName= ""{#ServiceDisplayName}"" binPath= ""{app}\{#AppExeName}"""; Flags: runhidden; StatusMsg: "Creating Windows service..."
Filename: "{sys}\sc.exe"; Parameters: "description ""{#ServiceName}"" ""{#ServiceDescription}"""; Flags: runhidden; StatusMsg: "Setting service description..."
Filename: "{sys}\sc.exe"; Parameters: "failure ""{#ServiceName}"" reset= 86400 actions= restart/5000/restart/5000/restart/5000"; Flags: runhidden; StatusMsg: "Configuring service recovery..."
Filename: "{sys}\sc.exe"; Parameters: "start ""{#ServiceName}"""; Flags: runhidden; StatusMsg: "Starting Windows service..."
Filename: "http://localhost:8090"; Description: "Open {#AppName} Web Interface"; Flags: nowait postinstall shellexec skipifsilent

[UninstallRun]
Filename: "{sys}\sc.exe"; Parameters: "stop ""{#ServiceName}"""; Flags: runhidden
Filename: "{sys}\sc.exe"; Parameters: "delete ""{#ServiceName}"""; Flags: runhidden

[Code]
function IsServiceInstalled(): Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec('sc.exe', 'query "{#ServiceName}"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

function StopService(): Boolean;
var
  ResultCode: Integer;
begin
  Log('Stopping service: {#ServiceName}');
  Result := Exec('sc.exe', 'stop "{#ServiceName}"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  if Result then
    Sleep(2000); // Wait for service to stop
end;

function RemoveService(): Boolean;
var
  ResultCode: Integer;
begin
  Log('Removing service: {#ServiceName}');
  Result := Exec('sc.exe', 'delete "{#ServiceName}"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  if Result then
    Sleep(1000); // Wait for service removal
end;

// Service installation is now handled by [Run] section

procedure CreateDirectoryStructure();
var
  ProgramDataRoot: String;
  ConfigDir, VersionsDir, LogsDir, DataDir: String;
  ConfigFile: String;
  DefaultConfig: String;
begin
  ProgramDataRoot := ExpandConstant('{commonappdata}') + '\ThingConnect.Pulse';
  ConfigDir := ProgramDataRoot + '\config';
  VersionsDir := ProgramDataRoot + '\versions';
  LogsDir := ProgramDataRoot + '\logs';
  DataDir := ProgramDataRoot + '\data';
  ConfigFile := ConfigDir + '\config.yaml';
  
  Log('Creating directory structure at: ' + ProgramDataRoot);
  
  ForceDirectories(ConfigDir);
  ForceDirectories(VersionsDir);
  ForceDirectories(LogsDir);
  ForceDirectories(DataDir);
  
  // Create default config file if it doesn't exist
  if not FileExists(ConfigFile) then
  begin
    DefaultConfig := 
      '# ThingConnect Pulse Configuration' + #13#10 +
      '# This is the main configuration file for network monitoring' + #13#10 +
      '# ' + #13#10 +
      '# For configuration syntax and examples, see:' + #13#10 +
      '# https://github.com/MachDatum/ThingConnect.Pulse/blob/main/docs/config.schema.json' + #13#10 +
      '' + #13#10 +
      '# Example configuration:' + #13#10 +
      '# targets:' + #13#10 +
      '#   - name: "Router"' + #13#10 +
      '#     endpoints:' + #13#10 +
      '#       - host: "192.168.1.1"' + #13#10 +
      '#         type: "icmp"' + #13#10 +
      '#   - name: "Web Services"' + #13#10 +
      '#     endpoints:' + #13#10 +
      '#       - host: "www.example.com"' + #13#10 +
      '#         type: "http"' + #13#10 +
      '#         path: "/health"' + #13#10 +
      '' + #13#10 +
      '# Empty configuration - add your monitoring targets above' + #13#10 +
      'targets: []' + #13#10;
      
    SaveStringToFile(ConfigFile, DefaultConfig, False);
    Log('Created default config file');
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  case CurStep of
    ssInstall:
      begin
        Log('=== Installation Step: Preparing installation ===');
        Log('Installation target directory: ' + ExpandConstant('{app}'));
        
        // Stop and remove existing service if present
        if IsServiceInstalled() then
        begin
          Log('Existing service detected, will be stopped and removed...');
          if StopService() then
            Log('Existing service stopped successfully')
          else
            Log('WARNING: Failed to stop existing service');
            
          if RemoveService() then
            Log('Existing service removed successfully')
          else
            Log('WARNING: Failed to remove existing service');
        end else
        begin
          Log('No existing service found');
        end;
      end;
      
    ssPostInstall:
      begin
        Log('=== Post-Install Step: Creating directory structure ===');
        
        // Create directory structure
        Log('Creating application data directories...');
        CreateDirectoryStructure();
        Log('Directory structure created successfully');
        
        // Log the service installation commands that will be executed by [Run] section
        Log('Service installation commands to be executed:');
        Log('1. sc.exe create "ThingConnectPulseSvc" start= auto DisplayName= "ThingConnect Pulse Server" binPath= "' + ExpandConstant('{app}') + '\ThingConnect.Pulse.Server.exe"');
        Log('2. sc.exe description "ThingConnectPulseSvc" "Network availability monitoring system for manufacturing sites"');
        Log('3. sc.exe failure "ThingConnectPulseSvc" reset= 86400 actions= restart/5000/restart/5000/restart/5000');
        Log('4. sc.exe start "ThingConnectPulseSvc"');
        Log('Service installation will be handled by [Run] section');
      end;
  end;
end;

function InitializeUninstall(): Boolean;
var
  Response: Integer;
  ProgramDataRoot: String;
begin
  Result := True;
  ProgramDataRoot := ExpandConstant('{commonappdata}') + '\ThingConnect.Pulse';
  
  // Ask user about data preservation
  Response := MsgBox(
    '{#AppName} Uninstaller' + #13#10 + #13#10 +
    'The following data will be PERMANENTLY DELETED:' + #13#10 +
    '• Configuration files and version history' + #13#10 +
    '• All monitoring data and historical records' + #13#10 +
    '• Log files' + #13#10 + #13#10 +
    'Do you want to keep your configuration and data files?' + #13#10 +
    '(Recommended if you plan to reinstall later)',
    mbConfirmation, MB_YESNOCANCEL
  );
  
  if Response = IDCANCEL then
  begin
    Result := False; // Cancel uninstall
    Exit;
  end;
  
  // Stop and remove service
  if IsServiceInstalled() then
  begin
    StopService();
    RemoveService();
  end;
  
  // Handle data cleanup based on user choice
  if Response = IDNO then
  begin
    Log('User chose to delete all data');
    // Remove data directories
    DelTree(ProgramDataRoot, True, True, True);
  end else
  begin
    Log('User chose to preserve configuration and data');
    MsgBox('Configuration and data files have been preserved in:' + #13#10 +
      ProgramDataRoot + #13#10 + #13#10 +
      'You can manually remove this directory later if needed.',
      mbInformation, MB_OK);
  end;
end;