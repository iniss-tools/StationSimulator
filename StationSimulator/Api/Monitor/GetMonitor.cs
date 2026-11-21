using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Monitor;
using StationSimulator.Contracts.Monitor;

namespace StationSimulator.Api.Monitor;

/// <summary>GET /api/monitor - instalacia ELEN Monitora.</summary>
public sealed class GetMonitor : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("monitor", async (IQueryHandler<GetMonitorQuery, MonitorDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetMonitorQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<MonitorDto>()
            .RequireAuthorization(Permissions.SimulatorView);
}
