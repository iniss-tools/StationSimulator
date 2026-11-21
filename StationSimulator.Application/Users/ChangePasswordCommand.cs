using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Users;

namespace StationSimulator.Application.Users;

/// <summary>Zmeni heslo prihlaseneho pouzivatela.</summary>
public sealed record ChangePasswordCommand(ChangePasswordRequest Request) : ICommand;
