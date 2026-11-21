using System.ComponentModel;

namespace StationSimulator.Mcp.Results;

/// <summary>Schema stanice v zozname.</summary>
public sealed record SchemaSummary(
    [property: Description("Schema number.")] int Id,
    [property: Description("Schema name.")] string Name,
    [property: Description("Canvas width in canvas units.")] int Width,
    [property: Description("Canvas height in canvas units.")] int Height,
    [property: Description("Number of drawing elements (tracks, platforms, buildings, areas, paths, texts).")] int Drawings,
    [property: Description("Number of device elements (boards, audio and light circuits, amplifiers, line states).")] int Devices,
    [property: Description("The schema has a background image.")] bool HasBackground);
