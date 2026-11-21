using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Mapping;
using StationSimulator.Application.Settings;
using StationSimulator.Contracts.Monitor;
using StationSimulator.Core.Monitor;

namespace StationSimulator.Application.Monitor;

public sealed class GetMonitorQueryHandler(ISettingsStore settings) : IQueryHandler<GetMonitorQuery, MonitorDto>
{
    public Task<Result<MonitorDto>> Handle(GetMonitorQuery query, CancellationToken cancellationToken)
    {
        var monitor = new MonitorFolder(settings.Current.MonitorFolder);
        var dto = new MonitorDto(monitor.Exists, monitor.Root,
            monitor.Exists ? monitor.Panels().Select(DtoMapper.ToDto).ToArray() : [],
            monitor.Projects().ToArray(),
            DtoMapper.ToDto(monitor.Look()));
        return Task.FromResult(Result.Success(dto));
    }
}
