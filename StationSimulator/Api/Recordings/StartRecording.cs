using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Recordings;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Api.Recordings;

/// <summary>POST /api/recordings/start - zacne zaznam.</summary>
public sealed class StartRecording : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("recordings/start", async (StartRecordingRequest request, ICommandHandler<StartRecordingCommand, RecorderStatusDto> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new StartRecordingCommand(request.Note), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<RecorderStatusDto>()
            .RequireAuthorization(Permissions.RecordingsManage);
}
