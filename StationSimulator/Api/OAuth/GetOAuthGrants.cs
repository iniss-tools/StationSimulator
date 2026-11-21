using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.OAuth;
using StationSimulator.Contracts.OAuth;

namespace StationSimulator.Api.OAuth;

/// <summary>GET /api/oauth/grants - prepojene aplikacie (vlastne; spravca klucov vsetky).</summary>
public sealed class GetOAuthGrants : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("oauth/grants", async (IQueryHandler<GetOAuthGrantsQuery, IReadOnlyList<OAuthGrantDto>> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetOAuthGrantsQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<IReadOnlyList<OAuthGrantDto>>()
            .RequireAuthorization(Permissions.SimulatorView);
}
