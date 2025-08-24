using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Globalization;
using ThingConnect.Pulse.Server.Data;

namespace ThingConnect.Pulse.Server.Services;

public sealed class SettingsService : ISettingsService
{
    private readonly PulseDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly SemaphoreSlim _semaphore;
    private readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(5);

    private const string LastRollup15mKey = "last_rollup_15m";
    private const string LastRollupDailyKey = "last_rollup_daily";
    private const string LastPruneKey = "last_prune";
    private const string VersionKey = "version";

    public SettingsService(PulseDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
        _semaphore = new SemaphoreSlim(1, 1);
    }

    public async Task<string?> GetAsync(string key)
    {
        string cacheKey = $"setting:{key}";

        if (_cache.TryGetValue(cacheKey, out string? cachedValue))
        {
            return cachedValue;
        }

        await _semaphore.WaitAsync();
        try
        {
            if (_cache.TryGetValue(cacheKey, out cachedValue))
            {
                return cachedValue;
            }

            Setting? setting = await _context.Settings
                .FirstOrDefaultAsync(s => s.K == key);

            string? value = setting?.V;
            _cache.Set(cacheKey, value, _cacheExpiration);

            return value;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task SetAsync(string key, string value)
    {
        await _semaphore.WaitAsync();
        try
        {
            Setting? setting = await _context.Settings
                .FirstOrDefaultAsync(s => s.K == key);

            if (setting == null)
            {
                setting = new Setting { K = key, V = value };
                _context.Settings.Add(setting);
            }
            else
            {
                setting.V = value;
            }

            await _context.SaveChangesAsync();

            string cacheKey = $"setting:{key}";
            _cache.Set(cacheKey, value, _cacheExpiration);
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<T?> GetAsync<T>(string key) where T : struct
    {
        string? stringValue = await GetAsync(key);
        if (string.IsNullOrEmpty(stringValue))
        {
            return null;
        }

        return ConvertToType<T>(stringValue);
    }

    public async Task<T?> GetAsync<T>(string key, T defaultValue) where T : struct
    {
        T? result = await GetAsync<T>(key);
        return result ?? defaultValue;
    }

    public async Task SetAsync<T>(string key, T value) where T : struct
    {
        string stringValue = ConvertToString(value);
        await SetAsync(key, stringValue);
    }

    public async Task<Dictionary<string, string>> GetManyAsync(params string[] keys)
    {
        var result = new Dictionary<string, string>();

        foreach (string key in keys)
        {
            string? value = await GetAsync(key);
            if (value != null)
            {
                result[key] = value;
            }
        }

        return result;
    }

    public async Task SetManyAsync(Dictionary<string, string> values)
    {
        await _semaphore.WaitAsync();
        try
        {
            List<Setting> existingSettings = await _context.Settings
                .Where(s => values.Keys.Contains(s.K))
                .ToListAsync();

            foreach (KeyValuePair<string, string> kvp in values)
            {
                Setting? existing = existingSettings.FirstOrDefault(s => s.K == kvp.Key);
                if (existing == null)
                {
                    _context.Settings.Add(new Setting { K = kvp.Key, V = kvp.Value });
                }
                else
                {
                    existing.V = kvp.Value;
                }

                string cacheKey = $"setting:{kvp.Key}";
                _cache.Set(cacheKey, kvp.Value, _cacheExpiration);
            }

            await _context.SaveChangesAsync();
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task DeleteAsync(string key)
    {
        await _semaphore.WaitAsync();
        try
        {
            Setting? setting = await _context.Settings
                .FirstOrDefaultAsync(s => s.K == key);

            if (setting != null)
            {
                _context.Settings.Remove(setting);
                await _context.SaveChangesAsync();
            }

            string cacheKey = $"setting:{key}";
            _cache.Remove(cacheKey);
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<bool> ExistsAsync(string key)
    {
        string? value = await GetAsync(key);
        return value != null;
    }

    public async Task<DateTimeOffset?> GetLastRollup15mTimestampAsync()
    {
        return await GetAsync<DateTimeOffset>(LastRollup15mKey);
    }

    public async Task SetLastRollup15mTimestampAsync(DateTimeOffset timestamp)
    {
        await SetAsync(LastRollup15mKey, timestamp);
    }

    public async Task<DateOnly?> GetLastRollupDailyDateAsync()
    {
        return await GetAsync<DateOnly>(LastRollupDailyKey);
    }

    public async Task SetLastRollupDailyDateAsync(DateOnly date)
    {
        await SetAsync(LastRollupDailyKey, date);
    }

    public async Task<DateTimeOffset?> GetLastPruneTimestampAsync()
    {
        return await GetAsync<DateTimeOffset>(LastPruneKey);
    }

    public async Task SetLastPruneTimestampAsync(DateTimeOffset timestamp)
    {
        await SetAsync(LastPruneKey, timestamp);
    }

    public async Task<string?> GetVersionAsync()
    {
        return await GetAsync(VersionKey);
    }

    public async Task SetVersionAsync(string version)
    {
        await SetAsync(VersionKey, version);
    }

    private static T? ConvertToType<T>(string value) where T : struct
    {
        try
        {
            if (typeof(T) == typeof(DateTimeOffset))
            {
                if (DateTimeOffset.TryParse(value, null, DateTimeStyles.RoundtripKind, out DateTimeOffset dateTimeOffset))
                {
                    return (T)(object)dateTimeOffset;
                }
            }
            else if (typeof(T) == typeof(DateOnly))
            {
                if (DateOnly.TryParse(value, out DateOnly dateOnly))
                {
                    return (T)(object)dateOnly;
                }
            }
            else if (typeof(T) == typeof(int))
            {
                if (int.TryParse(value, out int intValue))
                {
                    return (T)(object)intValue;
                }
            }
            else if (typeof(T) == typeof(long))
            {
                if (long.TryParse(value, out long longValue))
                {
                    return (T)(object)longValue;
                }
            }
            else if (typeof(T) == typeof(bool))
            {
                if (bool.TryParse(value, out bool boolValue))
                {
                    return (T)(object)boolValue;
                }
            }
            else if (typeof(T) == typeof(double))
            {
                if (double.TryParse(value, out double doubleValue))
                {
                    return (T)(object)doubleValue;
                }
            }
        }
        catch
        {
            // Return null on any conversion failure
        }

        return null;
    }

    private static string ConvertToString<T>(T value) where T : struct
    {
        if (typeof(T) == typeof(DateTimeOffset))
        {
            return ((DateTimeOffset)(object)value).ToString("O");
        }
        else if (typeof(T) == typeof(DateOnly))
        {
            return ((DateOnly)(object)value).ToString("yyyy-MM-dd");
        }

        return value.ToString() ?? string.Empty;
    }
}