
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ThingConnect.Pulse.Server.Services;

namespace ThingConnect.Pulse.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            
            // Database service
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=pulse.db";
            builder.Services.AddSingleton(new DatabaseService(connectionString));
            
            // JWT service
            builder.Services.AddSingleton<JwtService>();
            
            // JWT Authentication
            var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] ?? "ThisIsAVeryLongSecretKeyForJWTTokensWithAtLeast256BitsLength!";
            var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ThingConnect.Pulse";
            var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ThingConnect.Pulse.Client";
            
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecretKey)),
                        ValidateIssuer = true,
                        ValidIssuer = jwtIssuer,
                        ValidateAudience = true,
                        ValidAudience = jwtAudience,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero
                    };
                });

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            else
            {
                // Only serve static files in production
                app.UseDefaultFiles();
                app.UseStaticFiles();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            // Only serve SPA fallback in production
            if (!app.Environment.IsDevelopment())
            {
                app.MapFallbackToFile("/index.html");
            }

            app.Run();
        }
    }
}
