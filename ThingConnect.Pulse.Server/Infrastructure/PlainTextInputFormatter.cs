using Microsoft.AspNetCore.Mvc.Formatters;

namespace ThingConnect.Pulse.Server.Infrastructure;

public sealed class PlainTextInputFormatter : TextInputFormatter
{
    public PlainTextInputFormatter()
    {
        SupportedMediaTypes.Add("text/plain");
        SupportedEncodings.Add(System.Text.Encoding.UTF8);
    }

    protected override bool CanReadType(Type type)
    {
        return type == typeof(string);
    }

    public override async Task<InputFormatterResult> ReadRequestBodyAsync(
        InputFormatterContext context, System.Text.Encoding encoding)
    {
        using var reader = new StreamReader(context.HttpContext.Request.Body, encoding);
        string content = await reader.ReadToEndAsync();
        return await InputFormatterResult.SuccessAsync(content);
    }
}