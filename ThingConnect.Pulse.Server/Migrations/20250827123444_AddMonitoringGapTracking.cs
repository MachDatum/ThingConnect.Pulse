using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThingConnect.Pulse.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddMonitoringGapTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasMonitoringGap",
                table: "outage",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "MonitoringStoppedTs",
                table: "outage",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "monitoring_session",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    StartedTs = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    EndedTs = table.Column<DateTimeOffset>(type: "TEXT", nullable: true),
                    ShutdownReason = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    Version = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_monitoring_session", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_monitoring_session_EndedTs",
                table: "monitoring_session",
                column: "EndedTs");

            migrationBuilder.CreateIndex(
                name: "IX_monitoring_session_StartedTs",
                table: "monitoring_session",
                column: "StartedTs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "monitoring_session");

            migrationBuilder.DropColumn(
                name: "HasMonitoringGap",
                table: "outage");

            migrationBuilder.DropColumn(
                name: "MonitoringStoppedTs",
                table: "outage");
        }
    }
}
