using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Station;
using StationSimulator.Contracts.Station;

namespace StationSimulator.Api.Station;

/// <summary>POST /api/station/iniss - zalozi linky a tabule instalacie INISSu z nastavenia (volby v tele nepovinne).</summary>
public sealed class ImportInissStation : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("station/iniss", async (InissStationImportRequest? request, ICommandHandler<ImportInissStationCommand, StationImportedDto> handler,
                CancellationToken cancellationToken) =>
            (await handler.Handle(new ImportInissStationCommand(request), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<StationImportedDto>()
            .RequireAuthorization(Permissions.LinesManage);
}
