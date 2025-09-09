using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Serilog;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Infrastructure;
using ThingConnect.Pulse.Server.Services;
using ThingConnect.Pulse.Server.Services.Monitoring;
using ThingConnect.Pulse.Server.Services.Prune;
using ThingConnect.Pulse.Server.Services.Rollup;

namespace ThingConnect.Pulse.Server;

public class Program
{
    public static async Task Main(string[] args)
    {
        // Initialize path service for directory management
        var pathService = new PathService();

        // Create initial configuration to read Serilog settings
        IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"}.json", optional: true, reloadOnChange: true)
            .Build();

        // Configure Serilog from configuration files
        Log.Logger = new LoggerConfiguration()
            .ReadFrom.Configuration(configuration)
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .Enrich.WithProcessId()
            .CreateLogger();

        try
        {
            Log.Information("Starting ThingConnect Pulse Server");

            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

            // Use Serilog as the logging provider
            builder.Host.UseSerilog();

            // Configure Windows Service hosting
            builder.Host.UseWindowsService();

            // Add services to the container.
            builder.Services.AddDbContext<PulseDbContext>(options =>
                options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Configure Identity and Authentication
            builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                // Password settings
                options.Password.RequiredLength = 8;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequireDigit = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireLowercase = true;
                
                // Lockout settings
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30);
                options.Lockout.MaxFailedAccessAttempts = 5;
                
                // User settings
                options.User.RequireUniqueEmail = true;

                // Sign in settings
                options.SignIn.RequireConfirmedAccount = false;
                options.SignIn.RequireConfirmedEmail = false;
            })
            .AddEntityFrameworkStores<PulseDbContext>()
            .AddDefaultTokenProviders()
            .AddClaimsPrincipalFactory<ApplicationUserClaimsPrincipalFactory>();

            // Configure cookie authentication to override Identity defaults
            builder.Services.ConfigureApplicationCookie(options =>
            {
                options.LoginPath = "/login";
                options.LogoutPath = "/api/auth/logout";
                options.AccessDeniedPath = "/access-denied";
                options.ExpireTimeSpan = TimeSpan.FromHours(24);
                options.SlidingExpiration = true;
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() 
                    ? CookieSecurePolicy.SameAsRequest 
                    : CookieSecurePolicy.Always;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.Name = "ThingConnect.Pulse.Auth";
                options.Events.OnRedirectToLogin = context =>
                {
                    // For API requests, return 401 instead of redirect
                    if (context.Request.Path.StartsWithSegments("/api"))
                    {
                        context.Response.StatusCode = 401;
                        return Task.CompletedTask;
                    }
                    // For regular requests, redirect to frontend login page
                    context.Response.Redirect("/login");
                    return Task.CompletedTask;
                };
                options.Events.OnRedirectToAccessDenied = context =>
                {
                    // For API requests, return 403 instead of redirect
                    if (context.Request.Path.StartsWithSegments("/api"))
                    {
                        context.Response.StatusCode = 403;
                        return Task.CompletedTask;
                    }
                    // For regular requests, redirect to access denied page
                    context.Response.Redirect("/access-denied");
                    return Task.CompletedTask;
                };
            });

            // Configure Authorization
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy =>
                    policy.RequireRole(UserRoles.Administrator));
                
                options.AddPolicy("AuthenticatedUser", policy =>
                    policy.RequireAuthenticatedUser());
            });


            // Add memory cache for settings service
            builder.Services.AddMemoryCache();

            // Add HTTP client for probes
            builder.Services.AddHttpClient();

            // Add path service
            builder.Services.AddSingleton<IPathService, PathService>();


            // Add configuration services
            builder.Services.AddSingleton<ConfigurationParser>(serviceProvider =>
            {
                ILogger<ConfigurationParser> logger = serviceProvider.GetRequiredService<ILogger<ConfigurationParser>>();
                return ConfigurationParser.CreateAsync(logger).GetAwaiter().GetResult();
            });
            builder.Services.AddScoped<IConfigurationService, ConfigurationService>();
            builder.Services.AddScoped<ISettingsService, SettingsService>();

            // Add monitoring services
            builder.Services.AddScoped<IProbeService, ProbeService>();
            builder.Services.AddScoped<IOutageDetectionService, OutageDetectionService>();
            builder.Services.AddScoped<IDiscoveryService, DiscoveryService>();
            builder.Services.AddScoped<IStatusService, StatusService>();
            builder.Services.AddScoped<IHistoryService, HistoryService>();
            builder.Services.AddHostedService<MonitoringBackgroundService>();

            // Add rollup services
            builder.Services.AddScoped<IRollupService, RollupService>();
            builder.Services.AddHostedService<RollupBackgroundService>();

            // Add prune services
            builder.Services.AddScoped<IPruneService, PruneService>();

            // Add log cleanup service
            builder.Services.AddHostedService<LogCleanupBackgroundService>();

            // Add CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("https://localhost:55610", "http://localhost:55610", "https://localhost:5173", "http://localhost:5173", "https://localhost:55605", "https://localhost:55606", "http://localhost:55606")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials()
                          .WithExposedHeaders("Authorization");
                });
            });

            builder.Services.AddControllers(options =>
            {
                options.InputFormatters.Insert(0, new PlainTextInputFormatter());
            });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            WebApplication app = builder.Build();

            // Ensure all required directories exist
            using (IServiceScope scope = app.Services.CreateScope())
            {
                IPathService pathSvc = scope.ServiceProvider.GetRequiredService<IPathService>();
                await pathSvc.EnsureDirectoriesExistAsync();
                Log.Information("Directory structure verified at {RootPath}", pathSvc.GetRootDirectory());
            }

            // Initialize database with seed data in development
            if (app.Environment.IsDevelopment())
            {
                using IServiceScope scope = app.Services.CreateScope();
                PulseDbContext context = scope.ServiceProvider.GetRequiredService<PulseDbContext>();
                SeedData.Initialize(context);
            }

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors("AllowFrontend");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            Log.Information("ThingConnect Pulse Server configured successfully");
            app.Run();
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "ThingConnect Pulse Server terminated unexpectedly");
        }
        finally
        {
            Log.Information("ThingConnect Pulse Server stopped");
            Log.CloseAndFlush();
        }
    }
}
