using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Users;

namespace StationSimulator.Application.Users;

/// <summary>Zmeni meno, rolu a vypnutie pouzivatela.</summary>
public sealed record UpdateUserCommand(string UserName, UpdateUserRequest Request) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => UserName;
}
