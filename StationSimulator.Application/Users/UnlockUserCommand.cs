using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;

namespace StationSimulator.Application.Users;

/// <summary>Zrusi zablokovanie pouzivatela po neuspesnych pokusoch o prihlasenie.</summary>
public sealed record UnlockUserCommand(string UserName) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => UserName;
}
