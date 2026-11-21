using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Contracts.Auth;

namespace StationSimulator.Api.Auth;

/// <summary>GET /api/auth/me - prihlaseny pouzivatel a rezim prihlasenia (aj bez prihlasenia).</summary>
public sealed class GetMe : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("auth/me", async (IQueryHandler<GetMeQuery, MeDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetMeQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<MeDto>()
            .AllowAnonymous();
}
