using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Designs;

namespace StationSimulator.Application.Designs;

/// <summary>Ulozi vlastny vzhlad (rovnake id prekryje vstavany) - tabule s nim sa prekreslia hned.</summary>
public sealed record SetDesignCommand(string Id, SetDesignRequest Request) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id;
}
