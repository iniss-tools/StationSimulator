using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Application.Recordings;

/// <summary>Zacne zaznam prevadzky vsetkych liniek.</summary>
public sealed record StartRecordingCommand(string? Note) : ICommand<RecorderStatusDto>;
