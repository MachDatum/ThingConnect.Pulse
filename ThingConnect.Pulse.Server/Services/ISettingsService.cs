using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ThingConnect.Pulse.Server.Services;

public interface ISettingsService
{
    Task<string?> GetAsync(string key);
    Task SetAsync(string key, string value);
    Task<T?> GetAsync<T>(string key) where T : struct;
    Task<T?> GetAsync<T>(string key, T defaultValue) where T : struct;
    Task SetAsync<T>(string key, T value) where T : struct;
    Task<Dictionary<string, string>> GetManyAsync(params string[] keys);
    Task SetManyAsync(Dictionary<string, string> values);
    Task DeleteAsync(string key);
    Task<bool> ExistsAsync(string key);
    
    Task<DateTimeOffset?> GetLastRollup15mTimestampAsync();
    Task SetLastRollup15mTimestampAsync(DateTimeOffset timestamp);
    
    Task<DateOnly?> GetLastRollupDailyDateAsync();
    Task SetLastRollupDailyDateAsync(DateOnly date);
    
    Task<DateTimeOffset?> GetLastPruneTimestampAsync();
    Task SetLastPruneTimestampAsync(DateTimeOffset timestamp);
    
    Task<string?> GetVersionAsync();
    Task SetVersionAsync(string version);
}