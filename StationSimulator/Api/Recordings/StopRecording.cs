using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Recordings;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Api.Recordings;

/// <summary>POST /api/recordings/stop - ukonci zaznam.</summary>
public sealed class StopRecording : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("recordings/stop", async (ICommandHandler<StopRecordingCommand, RecorderStatusDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new StopRecordingCommand(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<RecorderStatusDto>()
            .RequireAuthorization(Permissions.RecordingsManage);
}
