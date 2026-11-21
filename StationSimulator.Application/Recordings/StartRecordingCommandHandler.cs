using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Application.Recordings;

public sealed class StartRecordingCommandHandler(RecordingService recordings) : ICommandHandler<StartRecordingCommand, RecorderStatusDto>
{
    public async Task<Result<RecorderStatusDto>> Handle(StartRecordingCommand command, CancellationToken cancellationToken) =>
        Result.Success(await recordings.StartAsync(command.Note).ConfigureAwait(false));
}
