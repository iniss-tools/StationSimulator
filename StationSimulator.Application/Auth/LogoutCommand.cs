using StationSimulator.Application.Abstractions.Messaging;

namespace StationSimulator.Application.Auth;

/// <summary>Odhlasi pouzivatela.</summary>
public sealed record LogoutCommand : ICommand;
