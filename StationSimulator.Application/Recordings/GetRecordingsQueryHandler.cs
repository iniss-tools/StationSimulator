using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Application.Recordings;

public sealed class GetRecordingsQueryHandler(RecordingService recordings) : IQueryHandler<GetRecordingsQuery, RecordingsDto>
{
    public Task<Result<RecordingsDto>> Handle(GetRecordingsQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(Result.Success(recordings.List()));
}
