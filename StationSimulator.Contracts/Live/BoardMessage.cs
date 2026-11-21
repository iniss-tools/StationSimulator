using StationSimulator.Contracts.Boards;

namespace StationSimulator.Contracts.Live;

/// <summary>Zmenila sa tabula.</summary>
public sealed record BoardMessage(BoardDto Board) : LiveMessage;
