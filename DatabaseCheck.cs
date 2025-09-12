using System;
using System.Data.SQLite;

class DatabaseCheck
{
    static void Main()
    {
        string connectionString = "Data Source=C:\\ProgramData\\ThingConnect.Pulse\\pulse.db;Version=3;";
        string endpointId = "08cdeb28-71d6-4732-b11d-f945fe9c15dc";

        using (var connection = new SQLiteConnection(connectionString))
        {
            connection.Open();

            string query = "SELECT id, name, host, type FROM endpoints WHERE id = @EndpointId";
            using (var command = new SQLiteCommand(query, connection))
            {
                command.Parameters.AddWithValue("@EndpointId", endpointId);

                using (var reader = command.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        Console.WriteLine($"Endpoint Found:");
                        Console.WriteLine($"ID: {reader["id"]}");
                        Console.WriteLine($"Name: {reader["name"]}");
                        Console.WriteLine($"Host: {reader["host"]}");
                        Console.WriteLine($"Type: {reader["type"]}");
                    }
                    else
                    {
                        Console.WriteLine("No endpoint found with the specified ID");
                    }
                }
            }
        }
    }
}