using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;

namespace StationSimulator.Application.Recordings;

public sealed class DeleteRecordingCommandHandler(RecordingService recordings) : ICommandHandler<DeleteRecordingCommand>
{
    public Task<Result> Handle(DeleteRecordingCommand command, CancellationToken cancellationToken)
    {
        if (!recordings.Exists(command.Name))
            return Task.FromResult(Result.Failure(RecordingErrors.NotFound(command.Name)));
        if (recordings.IsRecording(command.Name))
            return Task.FromResult(Result.Failure(RecordingErrors.InProgress(command.Name)));
        recordings.Delete(command.Name);
        return Task.FromResult(Result.Success());
    }
}
