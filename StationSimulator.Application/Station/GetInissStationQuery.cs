using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Station;

namespace StationSimulator.Application.Station;

/// <summary>Linky a tabule instalacie INISSu z nastavenia (nahlad pred nacitanim do simulatora).</summary>
public sealed record GetInissStationQuery : IQuery<InissStationDto>;
