using StationSimulator.Core.Lines;

namespace StationSimulator.Core.Statistics;

/// <summary>Zmena stavu linky (pripojenie, odpojenie, vypadok…).</summary>
public sealed record LineStatusChange(int Line, DateTimeOffset Time, LineStatus Status, string? Detail);
