namespace ThingConnect.Pulse.Server.Services;

public interface IConsentAwareSentryService
{
    Task InitializeIfConsentedAsync();
    void CaptureException(Exception exception);
    void CaptureMessage(string message, SentryLevel level = SentryLevel.Info);
}

public class ConsentAwareSentryService : IConsentAwareSentryService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ConsentAwareSentryService> _logger;
    private bool _sentryInitialized = false;
    private bool _consentChecked = false;

    public ConsentAwareSentryService(IServiceProvider serviceProvider, ILogger<ConsentAwareSentryService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task InitializeIfConsentedAsync()
    {
        if (_consentChecked)
        {
            return;
        }

        try
        {
            using IServiceScope scope = _serviceProvider.CreateScope();
            ISettingsService settingsService = scope.ServiceProvider.GetRequiredService<ISettingsService>();

            // Check if user has consented to error diagnostics
            string? errorDiagnosticsConsent = await settingsService.GetAsync("telemetry_error_diagnostics");
            bool hasErrorDiagnosticsConsent = bool.TryParse(errorDiagnosticsConsent, out bool errorValue) && errorValue;

            _consentChecked = true;

            if (hasErrorDiagnosticsConsent && !_sentryInitialized)
            {
                SentrySdk.Init(options =>
                {
                    options.Dsn = "https://8518fcf27e7b1fd9a09167ffc7a909d7@o349349.ingest.us.sentry.io/4510000957882368";

                    // Privacy-first configuration: no PII data collection
                    options.SendDefaultPii = false;

                    // Disable debug mode for production privacy
                    options.Debug = false;

                    // Note: Additional PII filtering would be done here if needed
                    // but SendDefaultPii = false already handles most privacy concerns
                });

                _sentryInitialized = true;
                _logger.LogInformation("Sentry initialized with user consent for error diagnostics");
            }
            else
            {
                _logger.LogInformation("Sentry not initialized - no user consent for error diagnostics");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to check telemetry consent for Sentry initialization");
        }
    }

    public void CaptureException(Exception exception)
    {
        if (_sentryInitialized)
        {
            SentrySdk.CaptureException(exception);
        }
    }

    public void CaptureMessage(string message, SentryLevel level = SentryLevel.Info)
    {
        if (_sentryInitialized)
        {
            SentrySdk.CaptureMessage(message, level);
        }
    }
}
