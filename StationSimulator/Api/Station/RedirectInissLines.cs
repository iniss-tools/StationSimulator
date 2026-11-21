using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Station;
using StationSimulator.Contracts.Station;

namespace StationSimulator.Api.Station;

/// <summary>POST /api/station/iniss/redirect - presmeruje linky servera INISS2 na simulator alebo presmerovanie zrusi.</summary>
public sealed class RedirectInissLines : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("station/iniss/redirect", async (InissRedirectRequest request, ICommandHandler<RedirectInissLinesCommand, InissStationDto> handler,
                CancellationToken cancellationToken) =>
            (await handler.Handle(new RedirectInissLinesCommand(request), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<InissStationDto>()
            .RequireAuthorization(Permissions.LinesManage);
}
