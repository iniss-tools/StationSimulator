using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Keys;

namespace StationSimulator.Application.Keys;

/// <summary>Vytvori pristupovy kluc; tajna hodnota je len vo vysledku (do auditu nejde).</summary>
public sealed record CreateAccessKeyCommand(CreateAccessKeyRequest Request) : ICommand<AccessKeyCreatedDto>, IAuditable
{
    string IAuditable.AuditTarget => Request.Name;
}
