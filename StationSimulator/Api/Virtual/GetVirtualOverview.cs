using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Virtual;
using StationSimulator.Contracts.Virtual;

namespace StationSimulator.Api.Virtual;

/// <summary>GET /api/virtual - virtualne tabule, najdene XML tabul a sledovane priecinky.</summary>
public sealed class GetVirtualOverview : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("virtual", async (IQueryHandler<GetVirtualOverviewQuery, VirtualOverviewDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetVirtualOverviewQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<VirtualOverviewDto>()
            .RequireAuthorization(Permissions.SimulatorView);
}
