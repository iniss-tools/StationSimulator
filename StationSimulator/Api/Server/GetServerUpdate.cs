using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Server;
using StationSimulator.Contracts.Server;

namespace StationSimulator.Api.Server;

/// <summary>GET /api/server/update - posledne zistena nova verzia servera.</summary>
public sealed class GetServerUpdate : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("server/update", async (IQueryHandler<GetServerUpdateQuery, ServerUpdateDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetServerUpdateQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<ServerUpdateDto>()
            .RequireAuthorization(Policies.ServerView);
}
