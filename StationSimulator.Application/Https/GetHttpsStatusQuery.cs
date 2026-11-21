using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Https;

namespace StationSimulator.Application.Https;

/// <summary>Stav HTTPS servera a jeho certifikatu.</summary>
public sealed record GetHttpsStatusQuery : IQuery<HttpsStatusDto>;
