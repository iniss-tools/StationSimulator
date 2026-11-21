using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;

namespace StationSimulator.Application.Recordings;

/// <summary>Odstrani zaznam (nie prave nahravany).</summary>
public sealed record DeleteRecordingCommand(string Name) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Name;
}
