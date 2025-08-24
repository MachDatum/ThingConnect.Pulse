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

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
; Application binaries from publish output
Source: "publish\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#AppName}"; Filename: "http://localhost:8080"; IconFilename: "{app}\{#AppExeName}"
Name: "{group}\Configuration"; Filename: "{commonappdata}\ThingConnect.Pulse\config\config.yaml"
Name: "{group}\Logs Directory"; Filename: "{commonappdata}\ThingConnect.Pulse\logs"
Name: "{group}\{cm:UninstallProgram,{#AppName}}"; Filename: "{uninstallexe}"

[Run]
Filename: "http://localhost:8080"; Description: "Open {#AppName} Web Interface"; Flags: nowait postinstall shellexec skipifsilent

[UninstallRun]
Filename: "sc.exe"; Parameters: "stop ""{#ServiceName}"""; Flags: runhidden
Filename: "sc.exe"; Parameters: "delete ""{#ServiceName}"""; Flags: runhidden

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

function InstallService(): Boolean;
var
  ServicePath: String;
  ResultCode: Integer;
begin
  ServicePath := '"' + ExpandConstant('{app}') + '\{#AppExeName}"';
  Log('Installing service: {#ServiceName} at ' + ServicePath);
  
  Result := Exec('sc.exe', Format('create "{#ServiceName}" binPath= "%s" DisplayName= "{#ServiceDisplayName}" start= auto', [ServicePath]), '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  
  if Result then
  begin
    // Set service description
    Exec('sc.exe', 'description "{#ServiceName}" "{#ServiceDescription}"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  end;
end;

function StartService(): Boolean;
var
  ResultCode: Integer;
begin
  Log('Starting service: {#ServiceName}');
  Result := Exec('sc.exe', 'start "{#ServiceName}"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

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
        // Stop and remove existing service if present
        if IsServiceInstalled() then
        begin
          StopService();
          RemoveService();
        end;
      end;
      
    ssPostInstall:
      begin
        // Create directory structure
        CreateDirectoryStructure();
        
        // Install and start the Windows service
        if InstallService() then
        begin
          Log('Service installed successfully');
          if not StartService() then
            MsgBox('Service installed but failed to start. You can start it manually from Services.msc', mbInformation, MB_OK);
        end else
        begin
          MsgBox('Failed to install Windows service. You may need to install manually using install-service.ps1', mbError, MB_OK);
        end;
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