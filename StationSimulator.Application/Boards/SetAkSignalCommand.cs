using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Boards;

namespace StationSimulator.Application.Boards;

/// <summary>Nastavi snimac tmy, stavy a casovanie ustredne AK Signal.</summary>
public sealed record SetAkSignalCommand(string Id, AkSignalSettingsRequest Settings) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id;
}
