using System.ComponentModel;
using StationSimulator.Contracts.Boards;

namespace StationSimulator.Mcp.Results;

/// <summary>Tabula s problemom.</summary>
public sealed record BoardIssue(
    string Id,
    string Name,
    FaultKind Fault,
    bool PoweredOff,
    [property: Description("INISS sends messages meant for another manufacturer; null = fine.")]
    ManufacturerMismatchDto? Mismatch);
