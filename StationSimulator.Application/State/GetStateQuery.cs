using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.State;

namespace StationSimulator.Application.State;

/// <summary>Cely stav simulatora pre prve nacitanie stranky.</summary>
public sealed record GetStateQuery : IQuery<StateDto>;
