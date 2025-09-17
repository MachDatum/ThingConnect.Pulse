namespace ThingConnect.Pulse.Server.Helpers;

public static class UnixTimestamp
{
    private static readonly DateTimeOffset UnixEpoch = new(1970, 1, 1, 0, 0, 0, TimeSpan.Zero);

    public static long Now() => DateTimeOffset.UtcNow.ToUnixTimeSeconds();

    public static long ToUnixSeconds(DateTimeOffset dateTime) => dateTime.ToUnixTimeSeconds();

    public static long ToUnixSeconds(DateTime dateTime) => new DateTimeOffset(dateTime, TimeSpan.Zero).ToUnixTimeSeconds();

    public static DateTimeOffset FromUnixSeconds(long unixSeconds) => DateTimeOffset.FromUnixTimeSeconds(unixSeconds);

    public static long ToUnixDate(DateOnly date)
    {
        var dateTime = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        return new DateTimeOffset(dateTime).ToUnixTimeSeconds();
    }

    public static DateOnly FromUnixDate(long unixSeconds)
    {
        var dateTime = DateTimeOffset.FromUnixTimeSeconds(unixSeconds);
        return DateOnly.FromDateTime(dateTime.Date);
    }

    public static long? ToUnixSeconds(DateTimeOffset? dateTime) => dateTime?.ToUnixTimeSeconds();

    public static DateTimeOffset? FromUnixSeconds(long? unixSeconds) =>
        unixSeconds.HasValue ? DateTimeOffset.FromUnixTimeSeconds(unixSeconds.Value) : null;

    public static long StartOfDay(long unixSeconds)
    {
        var dateTime = DateTimeOffset.FromUnixTimeSeconds(unixSeconds);
        var startOfDay = new DateTimeOffset(dateTime.Date, TimeSpan.Zero);
        return startOfDay.ToUnixTimeSeconds();
    }

    public static long Add(long unixSeconds, TimeSpan timeSpan)
    {
        return unixSeconds + (long)timeSpan.TotalSeconds;
    }

    public static long Subtract(long unixSeconds, TimeSpan timeSpan)
    {
        return unixSeconds - (long)timeSpan.TotalSeconds;
    }
}
