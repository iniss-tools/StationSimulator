using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Station;
using StationSimulator.Contracts.Station;

namespace StationSimulator.Api.Station;

/// <summary>POST /api/station - linky a tabule stanice INISSu (GVDEditor).</summary>
public sealed class ImportStation : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("station", async (StationImportRequest request, ICommandHandler<ImportStationCommand, StationImportedDto> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new ImportStationCommand(request), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<StationImportedDto>()
            .RequireAuthorization(Permissions.LinesManage);
}
