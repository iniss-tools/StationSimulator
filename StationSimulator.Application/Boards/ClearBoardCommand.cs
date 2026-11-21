using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;

namespace StationSimulator.Application.Boards;

/// <summary>Zmaze obsah tabule.</summary>
public sealed record ClearBoardCommand(string Id) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id;
}
