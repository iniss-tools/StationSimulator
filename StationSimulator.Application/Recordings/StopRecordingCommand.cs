using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Application.Recordings;

/// <summary>Ukonci zaznam.</summary>
public sealed record StopRecordingCommand : ICommand<RecorderStatusDto>;
