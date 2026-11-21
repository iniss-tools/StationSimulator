using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Application.Recordings;

public sealed class StopRecordingCommandHandler(RecordingService recordings) : ICommandHandler<StopRecordingCommand, RecorderStatusDto>
{
    public async Task<Result<RecorderStatusDto>> Handle(StopRecordingCommand command, CancellationToken cancellationToken) =>
        Result.Success(await recordings.StopAsync().ConfigureAwait(false));
}
