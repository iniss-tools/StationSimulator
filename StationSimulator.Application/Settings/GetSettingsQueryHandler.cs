using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Mapping;
using StationSimulator.Contracts.Settings;

namespace StationSimulator.Application.Settings;

public sealed class GetSettingsQueryHandler(ISettingsStore settings, DatabaseInfo database) : IQueryHandler<GetSettingsQuery, SettingsDto>
{
    public Task<Result<SettingsDto>> Handle(GetSettingsQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(Result.Success(DtoMapper.ToDto(settings.Current, database)));
}
