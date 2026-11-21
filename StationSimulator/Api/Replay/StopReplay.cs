using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Replay;

namespace StationSimulator.Api.Replay;

/// <summary>POST /api/replay/stop - zastavi prehravanie.</summary>
public sealed class StopReplay : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("replay/stop", async (ICommandHandler<StopReplayCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new StopReplayCommand(), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.RecordingsManage);
}
