using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Archive;
using StationSimulator.Core.Archive;

namespace StationSimulator.Application.Archive;

public sealed class GetArchiveDaysQueryHandler(ArchiveCatalog archive) : IQueryHandler<GetArchiveDaysQuery, ArchiveDaysDto>
{
    public Task<Result<ArchiveDaysDto>> Handle(GetArchiveDaysQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(Result.Success(new ArchiveDaysDto(
            archive.Days(ArchiveKind.Tables).Select(d => d.Date).ToArray(),
            archive.Days(ArchiveKind.Reports).Select(d => d.Date).ToArray())));
}
