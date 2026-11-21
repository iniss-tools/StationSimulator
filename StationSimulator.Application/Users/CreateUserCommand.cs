using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Users;

namespace StationSimulator.Application.Users;

/// <summary>Zalozi pouzivatela.</summary>
public sealed record CreateUserCommand(CreateUserRequest Request) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Request.UserName;
}
