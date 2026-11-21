using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;

namespace StationSimulator.Application.Virtual;

/// <summary>Odstrani vlastne rozlozenie, ktore ziadna tabula nepouziva.</summary>
public sealed record DeleteVirtualLayoutCommand(string Id) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id;
}
