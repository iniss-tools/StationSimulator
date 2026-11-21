using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Signage;
using StationSimulator.Contracts.Signage;

namespace StationSimulator.Api.Signage;

/// <summary>GET /api/signage - spravy, playlisty, skupiny a panely s tym, co prave hraju.</summary>
public sealed class GetSignageOverview : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("signage", async (IQueryHandler<GetSignageOverviewQuery, SignageOverviewDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetSignageOverviewQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<SignageOverviewDto>()
            .RequireAuthorization(Permissions.SimulatorView);
}
