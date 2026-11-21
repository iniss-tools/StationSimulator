using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Recordings;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Application.Replay;

public sealed class PlayRecordingCommandHandler(RecordingService recordings) : ICommandHandler<PlayRecordingCommand, ReplayStatusDto>
{
    public async Task<Result<ReplayStatusDto>> Handle(PlayRecordingCommand command, CancellationToken cancellationToken) =>
        await recordings.PlayAsync(command.Name, command.Speed, command.Loop, command.Position, command.Paused).ConfigureAwait(false) is { } status
            ? Result.Success(status)
            : Result.Failure<ReplayStatusDto>(RecordingErrors.NotFound(command.Name));
}
