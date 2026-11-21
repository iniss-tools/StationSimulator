using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Application.Recordings;

public sealed class UploadRecordingCommandHandler(RecordingService recordings) : ICommandHandler<UploadRecordingCommand, RecordingInfoDto>
{
    public async Task<Result<RecordingInfoDto>> Handle(UploadRecordingCommand command, CancellationToken cancellationToken) =>
        await recordings.UploadAsync(command.FileName, command.Content, cancellationToken).ConfigureAwait(false) is { } info
            ? Result.Success(info)
            : Result.Failure<RecordingInfoDto>(RecordingErrors.Format());
}
