using StationSimulator.Contracts.Lines;

namespace StationSimulator.Contracts.Statistics;

/// <summary>Zmena stavu linky; zmena pred zaciatkom obdobia je stav linky na jeho zaciatku.</summary>
public sealed record LineStatusChangeDto(int Line, DateTimeOffset Time, LineStatus Status, string? Detail);
