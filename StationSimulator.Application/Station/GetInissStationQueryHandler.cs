using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Settings;
using StationSimulator.Contracts.Station;

namespace StationSimulator.Application.Station;

public sealed class GetInissStationQueryHandler(ISettingsStore settings) : IQueryHandler<GetInissStationQuery, InissStationDto>
{
    public Task<Result<InissStationDto>> Handle(GetInissStationQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(InissStations.Read(settings.Current));
}
