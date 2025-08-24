
using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Infrastructure;
using ThingConnect.Pulse.Server.Services;
using ThingConnect.Pulse.Server.Services.Monitoring;

namespace ThingConnect.Pulse.Server;

public class Program
{
    public static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddDbContext<PulseDbContext>(options =>
            options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

        // Add memory cache for settings service
        builder.Services.AddMemoryCache();

        // Add HTTP client for probes
        builder.Services.AddHttpClient();

        // Add configuration services
        builder.Services.AddSingleton<ConfigParser>();
        builder.Services.AddScoped<IConfigurationService, ConfigurationService>();
        builder.Services.AddScoped<ISettingsService, SettingsService>();

        // Add monitoring services
        builder.Services.AddScoped<IProbeService, ProbeService>();
        builder.Services.AddScoped<IOutageDetectionService, OutageDetectionService>();
        builder.Services.AddScoped<IDiscoveryService, DiscoveryService>();
        builder.Services.AddScoped<IStatusService, StatusService>();
        builder.Services.AddScoped<IHistoryService, HistoryService>();
        builder.Services.AddHostedService<MonitoringBackgroundService>();

        builder.Services.AddControllers(options =>
        {
            options.InputFormatters.Insert(0, new PlainTextInputFormatter());
        });
        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        WebApplication app = builder.Build();

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

        app.UseAuthorization();


        app.MapControllers();

        app.MapFallbackToFile("/index.html");

        app.Run();
    }
}
