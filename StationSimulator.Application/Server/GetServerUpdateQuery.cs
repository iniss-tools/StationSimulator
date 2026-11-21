using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Server;

namespace StationSimulator.Application.Server;

/// <summary>Posledne zistena nova verzia servera.</summary>
public sealed record GetServerUpdateQuery : IQuery<ServerUpdateDto>;
