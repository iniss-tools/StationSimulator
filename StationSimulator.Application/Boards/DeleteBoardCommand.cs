using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;

namespace StationSimulator.Application.Boards;

/// <summary>Odstrani tabulu.</summary>
public sealed record DeleteBoardCommand(string Id) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id;
}
