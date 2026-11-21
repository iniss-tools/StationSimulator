using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.State;
using StationSimulator.Contracts.State;

namespace StationSimulator.Api.State;

/// <summary>GET /api/state - cely stav pre prve nacitanie stranky.</summary>
public sealed class GetState : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("state", async (IQueryHandler<GetStateQuery, StateDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetStateQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<StateDto>()
            .RequireAuthorization(Permissions.SimulatorView);
}
