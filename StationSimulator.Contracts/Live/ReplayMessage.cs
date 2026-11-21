using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Contracts.Live;

/// <summary>Priebeh prehravania zaznamu.</summary>
public sealed record ReplayMessage(ReplayStatusDto Status) : LiveMessage;
