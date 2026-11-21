using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Recordings;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Api.Recordings;

/// <summary>GET /api/recordings - zaznamy so stavom zaznamu a prehravania.</summary>
public sealed class GetRecordings : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("recordings", async (IQueryHandler<GetRecordingsQuery, RecordingsDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetRecordingsQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<RecordingsDto>()
            .RequireAuthorization(Permissions.SimulatorView);
}
