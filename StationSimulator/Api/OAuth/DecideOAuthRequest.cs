using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.OAuth;
using StationSimulator.Contracts.OAuth;

namespace StationSimulator.Api.OAuth;

/// <summary>POST /api/oauth/requests/{id} - povoli alebo zamietne pristup klienta MCP; vrati adresu navratu ku klientovi.</summary>
public sealed class DecideOAuthRequest : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("oauth/requests/{id}", async (string id, OAuthDecisionRequest request,
                ICommandHandler<DecideOAuthRequestCommand, OAuthRedirectDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new DecideOAuthRequestCommand(id, request), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<OAuthRedirectDto>()
            .RequireAuthorization(Permissions.SimulatorView);
}
