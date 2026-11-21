using StationSimulator.Core.Protocols;

namespace StationSimulator.Core.Simulation.Events;

/// <summary>Novy zaznam komunikacie.</summary>
public sealed record FrameLogged(FrameRecord Record) : SimulatorEvent;
