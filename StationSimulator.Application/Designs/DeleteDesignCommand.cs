using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;

namespace StationSimulator.Application.Designs;

/// <summary>Zmaze vlastny vzhlad; ak prekryval vstavany, tabule sa vratia k vstavanemu.</summary>
public sealed record DeleteDesignCommand(string Id) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id;
}
