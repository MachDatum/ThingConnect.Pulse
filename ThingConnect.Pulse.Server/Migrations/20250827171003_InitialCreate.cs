using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThingConnect.Pulse.Server.Migrations;

/// <inheritdoc />
public partial class InitialCreate : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "config_version",
            columns: table => new
            {
                Id = table.Column<string>(type: "TEXT", maxLength: 40, nullable: false),
                AppliedTs = table.Column<long>(type: "INTEGER", nullable: false),
                FileHash = table.Column<string>(type: "TEXT", nullable: false),
                FilePath = table.Column<string>(type: "TEXT", nullable: false),
                Actor = table.Column<string>(type: "TEXT", nullable: true),
                Note = table.Column<string>(type: "TEXT", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_config_version", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "group",
            columns: table => new
            {
                Id = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                ParentId = table.Column<string>(type: "TEXT", nullable: true),
                Color = table.Column<string>(type: "TEXT", maxLength: 7, nullable: true),
                SortOrder = table.Column<int>(type: "INTEGER", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_group", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "monitoring_session",
            columns: table => new
            {
                Id = table.Column<long>(type: "INTEGER", nullable: false)
                    .Annotation("Sqlite:Autoincrement", true),
                StartedTs = table.Column<long>(type: "INTEGER", nullable: false),
                EndedTs = table.Column<long>(type: "INTEGER", nullable: true),
                ShutdownReason = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                Version = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_monitoring_session", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "setting",
            columns: table => new
            {
                K = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                V = table.Column<string>(type: "TEXT", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_setting", x => x.K);
            });

        migrationBuilder.CreateTable(
            name: "endpoint",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "TEXT", nullable: false),
                Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                GroupId = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                Type = table.Column<string>(type: "TEXT", nullable: false),
                Host = table.Column<string>(type: "TEXT", maxLength: 253, nullable: false),
                Port = table.Column<int>(type: "INTEGER", nullable: true),
                HttpPath = table.Column<string>(type: "TEXT", maxLength: 512, nullable: true),
                HttpMatch = table.Column<string>(type: "TEXT", maxLength: 256, nullable: true),
                IntervalSeconds = table.Column<int>(type: "INTEGER", nullable: false),
                TimeoutMs = table.Column<int>(type: "INTEGER", nullable: false),
                Retries = table.Column<int>(type: "INTEGER", nullable: false),
                ExpectedRttMs = table.Column<int>(type: "INTEGER", nullable: true),
                Enabled = table.Column<bool>(type: "INTEGER", nullable: false),
                Notes = table.Column<string>(type: "TEXT", nullable: true),
                LastChangeTs = table.Column<long>(type: "INTEGER", nullable: true),
                LastStatus = table.Column<int>(type: "INTEGER", nullable: true),
                LastRttMs = table.Column<double>(type: "REAL", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_endpoint", x => x.Id);
                table.ForeignKey(
                    name: "FK_endpoint_group_GroupId",
                    column: x => x.GroupId,
                    principalTable: "group",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "check_result_raw",
            columns: table => new
            {
                Id = table.Column<long>(type: "INTEGER", nullable: false)
                    .Annotation("Sqlite:Autoincrement", true),
                EndpointId = table.Column<Guid>(type: "TEXT", nullable: false),
                Ts = table.Column<long>(type: "INTEGER", nullable: false),
                Status = table.Column<string>(type: "TEXT", nullable: false),
                RttMs = table.Column<double>(type: "double precision", nullable: true),
                Error = table.Column<string>(type: "TEXT", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_check_result_raw", x => x.Id);
                table.ForeignKey(
                    name: "FK_check_result_raw_endpoint_EndpointId",
                    column: x => x.EndpointId,
                    principalTable: "endpoint",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "outage",
            columns: table => new
            {
                Id = table.Column<long>(type: "INTEGER", nullable: false)
                    .Annotation("Sqlite:Autoincrement", true),
                EndpointId = table.Column<Guid>(type: "TEXT", nullable: false),
                StartedTs = table.Column<long>(type: "INTEGER", nullable: false),
                EndedTs = table.Column<long>(type: "INTEGER", nullable: true),
                DurationSeconds = table.Column<int>(type: "INTEGER", nullable: true),
                LastError = table.Column<string>(type: "TEXT", nullable: true),
                MonitoringStoppedTs = table.Column<long>(type: "INTEGER", nullable: true),
                HasMonitoringGap = table.Column<bool>(type: "INTEGER", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_outage", x => x.Id);
                table.ForeignKey(
                    name: "FK_outage_endpoint_EndpointId",
                    column: x => x.EndpointId,
                    principalTable: "endpoint",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "rollup_15m",
            columns: table => new
            {
                EndpointId = table.Column<Guid>(type: "TEXT", nullable: false),
                BucketTs = table.Column<long>(type: "INTEGER", nullable: false),
                UpPct = table.Column<double>(type: "REAL", nullable: false),
                AvgRttMs = table.Column<double>(type: "double precision", nullable: true),
                DownEvents = table.Column<int>(type: "INTEGER", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_rollup_15m", x => new { x.EndpointId, x.BucketTs });
                table.ForeignKey(
                    name: "FK_rollup_15m_endpoint_EndpointId",
                    column: x => x.EndpointId,
                    principalTable: "endpoint",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "rollup_daily",
            columns: table => new
            {
                EndpointId = table.Column<Guid>(type: "TEXT", nullable: false),
                BucketDate = table.Column<long>(type: "INTEGER", nullable: false),
                UpPct = table.Column<double>(type: "REAL", nullable: false),
                AvgRttMs = table.Column<double>(type: "double precision", nullable: true),
                DownEvents = table.Column<int>(type: "INTEGER", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_rollup_daily", x => new { x.EndpointId, x.BucketDate });
                table.ForeignKey(
                    name: "FK_rollup_daily_endpoint_EndpointId",
                    column: x => x.EndpointId,
                    principalTable: "endpoint",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_check_result_raw_EndpointId_Ts",
            table: "check_result_raw",
            columns: new[] { "EndpointId", "Ts" });

        migrationBuilder.CreateIndex(
            name: "IX_config_version_AppliedTs",
            table: "config_version",
            column: "AppliedTs");

        migrationBuilder.CreateIndex(
            name: "IX_endpoint_GroupId_Name",
            table: "endpoint",
            columns: new[] { "GroupId", "Name" });

        migrationBuilder.CreateIndex(
            name: "IX_endpoint_Host",
            table: "endpoint",
            column: "Host");

        migrationBuilder.CreateIndex(
            name: "IX_monitoring_session_EndedTs",
            table: "monitoring_session",
            column: "EndedTs");

        migrationBuilder.CreateIndex(
            name: "IX_monitoring_session_StartedTs",
            table: "monitoring_session",
            column: "StartedTs");

        migrationBuilder.CreateIndex(
            name: "IX_outage_EndpointId_EndedTs",
            table: "outage",
            columns: new[] { "EndpointId", "EndedTs" });

        migrationBuilder.CreateIndex(
            name: "IX_outage_EndpointId_StartedTs",
            table: "outage",
            columns: new[] { "EndpointId", "StartedTs" });

        migrationBuilder.CreateIndex(
            name: "IX_rollup_15m_BucketTs",
            table: "rollup_15m",
            column: "BucketTs");

        migrationBuilder.CreateIndex(
            name: "IX_rollup_daily_BucketDate",
            table: "rollup_daily",
            column: "BucketDate");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "check_result_raw");

        migrationBuilder.DropTable(
            name: "config_version");

        migrationBuilder.DropTable(
            name: "monitoring_session");

        migrationBuilder.DropTable(
            name: "outage");

        migrationBuilder.DropTable(
            name: "rollup_15m");

        migrationBuilder.DropTable(
            name: "rollup_daily");

        migrationBuilder.DropTable(
            name: "setting");

        migrationBuilder.DropTable(
            name: "endpoint");

        migrationBuilder.DropTable(
            name: "group");
    }
}
