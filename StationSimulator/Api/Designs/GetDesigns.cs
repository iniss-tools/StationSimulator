using JetBrains.Annotations;
using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Designs;
using StationSimulator.Contracts.Designs;

namespace StationSimulator.Api.Designs;

/// <summary>GET /api/designs - vzhlady tabul.</summary>
[UsedImplicitly]
public sealed class GetDesigns : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("designs", async (IQueryHandler<GetDesignsQuery, DesignInfoDto[]> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetDesignsQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<DesignInfoDto[]>()
            .RequireAuthorization(Permissions.SimulatorView);
}
