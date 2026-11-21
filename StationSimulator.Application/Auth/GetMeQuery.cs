using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Auth;

namespace StationSimulator.Application.Auth;

/// <summary>Prihlaseny pouzivatel a rezim prihlasenia.</summary>
public sealed record GetMeQuery : IQuery<MeDto>;
