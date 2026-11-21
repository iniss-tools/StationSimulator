using System.Text.Json;
using StationSimulator.Contracts.Schemas;

namespace StationSimulator.Application.Schemas;

/// <summary>Prevod schemy stanice medzi API a databazou.</summary>
public static class SchemaMapping
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public static string Serialize(StationSchemaRequest request) => JsonSerializer.Serialize(request, Json);

    public static StationSchemaRequest Deserialize(string json) =>
        JsonSerializer.Deserialize<StationSchemaRequest>(json, Json) ?? throw new JsonException("Empty schema definition.");

    /// <summary>Schema pre API.</summary>
    /// <param name="record">schema v databaze</param>
    /// <param name="background">verzia obrazka pozadia; null = bez obrazka</param>
    public static StationSchemaDto ToDto(StationSchemaRecord record, string? background)
    {
        ArgumentNullException.ThrowIfNull(record);
        var definition = Deserialize(record.Definition);
        return new StationSchemaDto(record.Id, record.Name, definition.Width, definition.Height, definition.Elements)
        {
            Background = background,
            BackgroundOpacity = definition.BackgroundOpacity,
            BackgroundX = definition.BackgroundX,
            BackgroundY = definition.BackgroundY,
            BackgroundWidth = definition.BackgroundWidth,
            BackgroundHeight = definition.BackgroundHeight
        };
    }
}
