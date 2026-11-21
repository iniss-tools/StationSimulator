using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Boards;

namespace StationSimulator.Application.Boards;

/// <summary>Zapne alebo vypne predstieranu poruchu tabule.</summary>
public sealed record SetBoardFaultCommand(string Id, BoardFaultDto Fault) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id;
}
