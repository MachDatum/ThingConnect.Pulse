using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThingConnect.Pulse.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "notification",
                columns: table => new
                {
                    Id = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Priority = table.Column<string>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    ActionUrl = table.Column<string>(type: "TEXT", maxLength: 512, nullable: true),
                    ActionText = table.Column<string>(type: "TEXT", maxLength: 100, nullable: true),
                    ValidFromTs = table.Column<long>(type: "INTEGER", nullable: false),
                    ValidUntilTs = table.Column<long>(type: "INTEGER", nullable: false),
                    TargetVersions = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    ShowOnce = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsRead = table.Column<bool>(type: "INTEGER", nullable: false),
                    IsShown = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedTs = table.Column<long>(type: "INTEGER", nullable: false),
                    ReadTs = table.Column<long>(type: "INTEGER", nullable: true),
                    ShownTs = table.Column<long>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "notification_fetch",
                columns: table => new
                {
                    Id = table.Column<long>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FetchTs = table.Column<long>(type: "INTEGER", nullable: false),
                    RemoteVersion = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    RemoteLastUpdated = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    NotificationCount = table.Column<int>(type: "INTEGER", nullable: false),
                    Success = table.Column<bool>(type: "INTEGER", nullable: false),
                    Error = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notification_fetch", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_notification_IsRead_ValidFromTs",
                table: "notification",
                columns: new[] { "IsRead", "ValidFromTs" });

            migrationBuilder.CreateIndex(
                name: "IX_notification_Priority_ValidFromTs",
                table: "notification",
                columns: new[] { "Priority", "ValidFromTs" });

            migrationBuilder.CreateIndex(
                name: "IX_notification_ValidFromTs",
                table: "notification",
                column: "ValidFromTs");

            migrationBuilder.CreateIndex(
                name: "IX_notification_ValidUntilTs",
                table: "notification",
                column: "ValidUntilTs");

            migrationBuilder.CreateIndex(
                name: "IX_notification_fetch_FetchTs",
                table: "notification_fetch",
                column: "FetchTs");

            migrationBuilder.CreateIndex(
                name: "IX_notification_fetch_Success",
                table: "notification_fetch",
                column: "Success");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "notification");

            migrationBuilder.DropTable(
                name: "notification_fetch");
        }
    }
}
