using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Server;

namespace StationSimulator.Application.Server;

/// <summary>Zisti novu verziu servera hned (aj ked je pravidelna kontrola v nastaveni vypnuta).</summary>
public sealed record CheckServerUpdateCommand : ICommand<ServerUpdateDto>;
