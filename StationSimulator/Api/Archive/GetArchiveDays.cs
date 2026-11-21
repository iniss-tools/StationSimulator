using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Archive;
using StationSimulator.Application.Auth;
using StationSimulator.Contracts.Archive;

namespace StationSimulator.Api.Archive;

/// <summary>GET /api/archive - dni dennych archivov tabul a hlaseni.</summary>
public sealed class GetArchiveDays : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("archive", async (IQueryHandler<GetArchiveDaysQuery, ArchiveDaysDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetArchiveDaysQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<ArchiveDaysDto>()
            .RequireAuthorization(Permissions.ArchiveView);
}
