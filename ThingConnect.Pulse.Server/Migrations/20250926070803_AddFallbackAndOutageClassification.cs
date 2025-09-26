using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThingConnect.Pulse.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddFallbackAndOutageClassification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Classification",
                table: "outage",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Classification",
                table: "check_result_raw",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "FallbackAttempted",
                table: "check_result_raw",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FallbackError",
                table: "check_result_raw",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "FallbackRttMs",
                table: "check_result_raw",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FallbackStatus",
                table: "check_result_raw",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Classification",
                table: "outage");

            migrationBuilder.DropColumn(
                name: "Classification",
                table: "check_result_raw");

            migrationBuilder.DropColumn(
                name: "FallbackAttempted",
                table: "check_result_raw");

            migrationBuilder.DropColumn(
                name: "FallbackError",
                table: "check_result_raw");

            migrationBuilder.DropColumn(
                name: "FallbackRttMs",
                table: "check_result_raw");

            migrationBuilder.DropColumn(
                name: "FallbackStatus",
                table: "check_result_raw");
        }
    }
}
