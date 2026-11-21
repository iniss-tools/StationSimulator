using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Faces;

namespace StationSimulator.Application.Faces;

/// <summary>Zalozi alebo zmeni vlastnu predlohu cela s klucom <paramref name="Id" />.</summary>
public sealed record SetFaceCommand(string Id, BoardFaceDto Face) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id;
}
