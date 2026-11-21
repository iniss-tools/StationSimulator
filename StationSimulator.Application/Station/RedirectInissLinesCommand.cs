using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Station;

namespace StationSimulator.Application.Station;

/// <summary>Presmeruje linky servera INISS2 z nastavenia na simulator alebo presmerovanie zrusi.</summary>
/// <param name="Request">co sa ma stat</param>
public sealed record RedirectInissLinesCommand(InissRedirectRequest Request) : ICommand<InissStationDto>;
