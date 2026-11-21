using StationSimulator.Contracts.Lines;

namespace StationSimulator.Contracts.Live;

/// <summary>Zmenila sa linka (stav, pocitadla).</summary>
public sealed record LineMessage(LineDto Line) : LiveMessage;
