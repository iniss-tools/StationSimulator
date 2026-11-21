using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;

namespace StationSimulator.Application.Users;

/// <summary>Odstrani pouzivatela.</summary>
public sealed record DeleteUserCommand(string UserName) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => UserName;
}
