using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Auth;

namespace StationSimulator.Application.Auth;

/// <summary>Prihlasi pouzivatela.</summary>
public sealed record LoginCommand(string UserName, string Password, bool Remember) : ICommand<MeDto>, IAuditable
{
    string IAuditable.AuditTarget => UserName;
}
