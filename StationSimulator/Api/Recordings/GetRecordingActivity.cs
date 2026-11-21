using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Recordings;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Api.Recordings;

/// <summary>GET /api/recordings/{name}/activity?buckets= - hustota sprav INISSu v zazname (casova os prehravania).</summary>
public sealed class GetRecordingActivity : IEndpoint
{
    private const int DefaultBuckets = 300;

    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("recordings/{name}/activity", async (string name, int? buckets, IQueryHandler<GetRecordingActivityQuery, RecordingActivityDto> handler,
                CancellationToken cancellationToken) =>
            (await handler.Handle(new GetRecordingActivityQuery(name, buckets ?? DefaultBuckets), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<RecordingActivityDto>()
            .RequireAuthorization(Permissions.SimulatorView);
}
