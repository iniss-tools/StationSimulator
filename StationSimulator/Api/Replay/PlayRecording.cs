using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Replay;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Api.Replay;

/// <summary>POST /api/replay - prehra zaznam.</summary>
public sealed class PlayRecording : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("replay", async (PlayRequest request, ICommandHandler<PlayRecordingCommand, ReplayStatusDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new PlayRecordingCommand(request.Name, request.Speed, request.Loop, request.Position, request.Paused), cancellationToken))
            .Match(Results.Ok, CustomResults.Problem))
            .Produces<ReplayStatusDto>()
            .RequireAuthorization(Permissions.RecordingsManage);
}
