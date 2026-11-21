using StationSimulator.Application.Abstractions.Messaging;

namespace StationSimulator.Application.Server;

/// <summary>Restart servera sluzby Windows (zmeny nastavenia, ktore sa prejavia az po restarte).</summary>
public sealed record RestartServerCommand : ICommand;
