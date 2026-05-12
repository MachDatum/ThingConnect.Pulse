using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Data.Common;

namespace ThingConnect.Pulse.Server.Infrastructure;

/// <summary>
/// Enables WAL mode and busy_timeout on every SQLite connection to allow concurrent reads
/// during high-frequency writes from the monitoring background service.
///
/// Without WAL, SQLite's default DELETE journal mode holds an exclusive lock for the
/// duration of each write, causing read timeouts when probes are writing continuously.
/// WAL mode decouples readers from writers entirely.
/// </summary>
public sealed class SqliteWalInterceptor : DbConnectionInterceptor
{
    public override void ConnectionOpened(DbConnection connection, ConnectionEndEventData eventData)
    {
        ApplyPragmas(connection);
    }

    public override async Task ConnectionOpenedAsync(
        DbConnection connection,
        ConnectionEndEventData eventData,
        CancellationToken cancellationToken = default)
    {
        await ApplyPragmasAsync(connection, cancellationToken);
    }

    [System.Diagnostics.CodeAnalysis.SuppressMessage("Security", "CA2100", Justification = "Pragma SQL is a compile-time constant, not user input.")]
    private static void ApplyPragmas(DbConnection connection)
    {
        using DbCommand cmd = connection.CreateCommand();
        cmd.CommandText = BuildPragmaSql();
        cmd.ExecuteNonQuery();
    }

    [System.Diagnostics.CodeAnalysis.SuppressMessage("Security", "CA2100", Justification = "Pragma SQL is a compile-time constant, not user input.")]
    private static async Task ApplyPragmasAsync(DbConnection connection, CancellationToken ct)
    {
        await using DbCommand cmd = connection.CreateCommand();
        cmd.CommandText = BuildPragmaSql();
        await cmd.ExecuteNonQueryAsync(ct);
    }

    private static string BuildPragmaSql() => """
        PRAGMA journal_mode=WAL;
        PRAGMA busy_timeout=5000;
        PRAGMA synchronous=NORMAL;
        PRAGMA cache_size=-8000;
        """;
}
