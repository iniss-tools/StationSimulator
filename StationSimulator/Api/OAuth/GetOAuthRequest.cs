using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.OAuth;
using StationSimulator.Contracts.OAuth;

namespace StationSimulator.Api.OAuth;

/// <summary>GET /api/oauth/requests/{id} - ziadost klienta MCP pre stranku povolenia.</summary>
public sealed class GetOAuthRequest : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("oauth/requests/{id}", async (string id, IQueryHandler<GetOAuthRequestQuery, OAuthRequestDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetOAuthRequestQuery(id), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<OAuthRequestDto>()
            .RequireAuthorization(Permissions.SimulatorView);
}
