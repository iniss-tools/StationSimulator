using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Auth;

namespace StationSimulator.Application.Auth;

/// <summary>Zalozi prveho spravcu a prihlasi ho.</summary>
public sealed record SetupCommand(string UserName, string DisplayName, string Password) : ICommand<MeDto>, IAuditable
{
    string IAuditable.AuditTarget => UserName;
}
