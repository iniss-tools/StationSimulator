using StationSimulator.Contracts.Boards;

namespace StationSimulator.Contracts.Monitor;

/// <summary>Predloha tabule z typu panelu ELEN Monitora.</summary>
/// <param name="File">subor typu panelu (<c>.cfg</c>)</param>
public sealed record BoardTemplateDto(string File, string Name, BoardProfileDto Profile);
