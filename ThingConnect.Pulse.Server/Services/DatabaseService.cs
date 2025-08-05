using Dapper;
using Microsoft.Data.Sqlite;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services
{
    public class DatabaseService
    {
        private readonly string _connectionString;

        public DatabaseService(string connectionString)
        {
            _connectionString = connectionString;
            InitializeDatabase();
        }

        private void InitializeDatabase()
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            var createUsersTable = @"
                CREATE TABLE IF NOT EXISTS Users (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Username TEXT UNIQUE NOT NULL,
                    Email TEXT UNIQUE NOT NULL,
                    PasswordHash TEXT NOT NULL,
                    CreatedAt TEXT NOT NULL
                )";

            connection.Execute(createUsersTable);
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            using var connection = new SqliteConnection(_connectionString);
            return await connection.QueryFirstOrDefaultAsync<User>(
                "SELECT * FROM Users WHERE Username = @Username", 
                new { Username = username });
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            using var connection = new SqliteConnection(_connectionString);
            return await connection.QueryFirstOrDefaultAsync<User>(
                "SELECT * FROM Users WHERE Email = @Email", 
                new { Email = email });
        }

        public async Task<int> CreateUserAsync(User user)
        {
            using var connection = new SqliteConnection(_connectionString);
            var sql = @"
                INSERT INTO Users (Username, Email, PasswordHash, CreatedAt) 
                VALUES (@Username, @Email, @PasswordHash, @CreatedAt);
                SELECT last_insert_rowid();";
            
            return await connection.QuerySingleAsync<int>(sql, user);
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            using var connection = new SqliteConnection(_connectionString);
            return await connection.QueryFirstOrDefaultAsync<User>(
                "SELECT * FROM Users WHERE Id = @Id", 
                new { Id = id });
        }
    }
}