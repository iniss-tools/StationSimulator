using System.Globalization;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;

namespace StationSimulator.Application.Keys;

/// <summary>Odstrani pristupovy kluc - prestane platit hned.</summary>
public sealed record DeleteAccessKeyCommand(Guid Id) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id.ToString("D", CultureInfo.InvariantCulture);
}
