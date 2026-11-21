using System.Globalization;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;

namespace StationSimulator.Application.OAuth;

/// <summary>Zrusi povolenie klienta MCP - jeho tokeny prestanu platit hned.</summary>
public sealed record DeleteOAuthGrantCommand(Guid Id) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id.ToString("D", CultureInfo.InvariantCulture);
}
