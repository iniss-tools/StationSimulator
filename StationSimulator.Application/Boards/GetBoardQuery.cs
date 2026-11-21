using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Boards;

namespace StationSimulator.Application.Boards;

/// <summary>Tabula podla identifikatora <c>linka-adresa</c>.</summary>
public sealed record GetBoardQuery(string Id) : IQuery<BoardDto>;
