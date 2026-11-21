using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Settings;
using StationSimulator.Contracts.Server;

namespace StationSimulator.Application.Server;

public sealed class GetServerInfoQueryHandler(IServerHost host, AppPaths paths) : IQueryHandler<GetServerInfoQuery, ServerInfoDto>
{
    public Task<Result<ServerInfoDto>> Handle(GetServerInfoQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(Result.Success(new ServerInfoDto(host.RunningAsService, host.Version, paths.DataFolder, host.Addresses)));
}
