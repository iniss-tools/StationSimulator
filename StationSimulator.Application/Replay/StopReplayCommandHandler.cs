using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Recordings;

namespace StationSimulator.Application.Replay;

public sealed class StopReplayCommandHandler(RecordingService recordings) : ICommandHandler<StopReplayCommand>
{
    public async Task<Result> Handle(StopReplayCommand command, CancellationToken cancellationToken)
    {
        await recordings.StopReplayAsync().ConfigureAwait(false);
        return Result.Success();
    }
}
