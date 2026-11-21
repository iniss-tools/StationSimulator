using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Server;
using StationSimulator.Contracts.Server;

namespace StationSimulator.Api.Server;

/// <summary>GET /api/server - ako server bezi.</summary>
public sealed class GetServerInfo : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("server", async (IQueryHandler<GetServerInfoQuery, ServerInfoDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetServerInfoQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<ServerInfoDto>()
            .RequireAuthorization(Policies.ServerView);
}
