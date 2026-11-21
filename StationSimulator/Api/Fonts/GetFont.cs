using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Fonts;
using StationSimulator.Contracts.Fonts;

namespace StationSimulator.Api.Fonts;

/// <summary>GET /api/fonts/{file} - subor pisiem ELEN pre prehliadac.</summary>
public sealed class GetFont : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("fonts/{file}", async (string file, IQueryHandler<GetFontQuery, FontFileDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetFontQuery(file), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<FontFileDto>()
            .RequireAuthorization(Permissions.SimulatorView);
}
