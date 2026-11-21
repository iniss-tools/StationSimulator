using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Station;
using StationSimulator.Contracts.Station;

namespace StationSimulator.Api.Station;

/// <summary>GET /api/station/iniss - linky a tabule instalacie INISSu z nastavenia (nahlad).</summary>
public sealed class GetInissStation : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("station/iniss", async (IQueryHandler<GetInissStationQuery, InissStationDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetInissStationQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<InissStationDto>()
            .RequireAuthorization(Permissions.LinesManage);
}
