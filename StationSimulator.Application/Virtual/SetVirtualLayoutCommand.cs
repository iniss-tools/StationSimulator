using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Virtual;

namespace StationSimulator.Application.Virtual;

/// <summary>Zalozi alebo zmeni vlastne rozlozenie s klucom <paramref name="Id" />.</summary>
public sealed record SetVirtualLayoutCommand(string Id, VirtualLayoutDto Layout) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id;
}
