using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Contracts.Live;

/// <summary>Stav prebiehajuceho zaznamu.</summary>
public sealed record RecorderMessage(RecorderStatusDto Status) : LiveMessage;
