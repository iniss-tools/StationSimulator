namespace StationSimulator.Contracts.Schemas;

/// <summary>Schema stanice s cislom.</summary>
/// <param name="Id">cislo</param>
/// <param name="Name">nazov</param>
/// <param name="Width">sirka platna</param>
/// <param name="Height">vyska platna</param>
/// <param name="Elements">prvky odspodu - neskorsi prekryva skorsi</param>
public sealed record StationSchemaDto(int Id, string Name, int Width, int Height, IReadOnlyList<SchemaElementDto> Elements)
{
    /// <summary>Verzia obrazka pozadia (GET /api/schemas/{id}/background); null = schema obrazok nema.</summary>
    public string? Background { get; init; }

    /// <summary>Krytie obrazka pozadia 0-1.</summary>
    public double BackgroundOpacity { get; init; } = 0.5;

    /// <summary>Vodorovna poloha laveho okraja obrazka pozadia na platne.</summary>
    public double BackgroundX { get; init; }

    /// <summary>Zvisla poloha horneho okraja obrazka pozadia na platne.</summary>
    public double BackgroundY { get; init; }

    /// <summary>Sirka plochy obrazka pozadia; 0 = cele platno (poloha sa vtedy neberie do uvahy).</summary>
    public double BackgroundWidth { get; init; }

    /// <summary>Vyska plochy obrazka pozadia; 0 = cele platno. Obrazok sa do plochy kresli cely so zachovanim pomeru stran.</summary>
    public double BackgroundHeight { get; init; }
}
