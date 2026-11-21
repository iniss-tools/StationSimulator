namespace StationSimulator.Contracts.Schemas;

/// <summary>Schema stanice (telo POST /api/schemas a PUT /api/schemas/{id}).</summary>
/// <param name="Name">nazov</param>
/// <param name="Width">sirka platna</param>
/// <param name="Height">vyska platna</param>
/// <param name="Elements">prvky odspodu - neskorsi prekryva skorsi</param>
public sealed record StationSchemaRequest(string Name, int Width, int Height, IReadOnlyList<SchemaElementDto> Elements)
{
    /// <summary>Krytie obrazka pozadia 0-1 (obrazok sa nahrava zvlast cez PUT /api/schemas/{id}/background).</summary>
    public double BackgroundOpacity { get; init; } = 0.5;
}
