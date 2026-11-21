using RecordingFileFormat = StationSimulator.Core.Recording.RecordingFile;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;

namespace StationSimulator.Application.Recordings;

public sealed class GetRecordingFileQueryHandler(RecordingService recordings) : IQueryHandler<GetRecordingFileQuery, RecordingFile>
{
    public Task<Result<RecordingFile>> Handle(GetRecordingFileQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(recordings.Exists(query.Name)
            ? Result.Success(new RecordingFile(recordings.PathFor(query.Name)!, query.Name + RecordingFileFormat.Extension))
            : Result.Failure<RecordingFile>(RecordingErrors.NotFound(query.Name)));
}
