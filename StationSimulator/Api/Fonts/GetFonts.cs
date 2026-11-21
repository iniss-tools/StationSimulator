using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Fonts;

namespace StationSimulator.Api.Fonts;

/// <summary>GET /api/fonts - subory pisiem ELEN.</summary>
public sealed class GetFonts : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("fonts", async (IQueryHandler<GetFontsQuery, string[]> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetFontsQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<string[]>()
            .RequireAuthorization(Permissions.SimulatorView);
}
