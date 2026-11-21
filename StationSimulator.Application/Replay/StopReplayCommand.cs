using StationSimulator.Application.Abstractions.Messaging;

namespace StationSimulator.Application.Replay;

/// <summary>Zastavi prehravanie zaznamu.</summary>
public sealed record StopReplayCommand : ICommand;
