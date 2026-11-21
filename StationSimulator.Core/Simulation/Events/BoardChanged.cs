namespace StationSimulator.Core.Simulation.Events;

/// <summary>Tabula zmenila obsah alebo nastavenie.</summary>
public sealed record BoardChanged(string BoardId) : SimulatorEvent;
