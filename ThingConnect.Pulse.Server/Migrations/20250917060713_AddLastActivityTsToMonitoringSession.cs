using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThingConnect.Pulse.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddLastActivityTsToMonitoringSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "LastActivityTs",
                table: "monitoring_session",
                type: "INTEGER",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastActivityTs",
                table: "monitoring_session");
        }
    }
}
