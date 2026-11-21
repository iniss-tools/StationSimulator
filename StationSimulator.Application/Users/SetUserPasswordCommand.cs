using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Users;

namespace StationSimulator.Application.Users;

/// <summary>Nastavi pouzivatelovi nove heslo (spravca).</summary>
public sealed record SetUserPasswordCommand(string UserName, SetPasswordRequest Request) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => UserName;
}
