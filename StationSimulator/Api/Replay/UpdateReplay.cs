using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Replay;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Api.Replay;

/// <summary>PUT /api/replay - pozastavi, posunie, zmeni rychlost alebo opakovanie posledneho prehravania.</summary>
public sealed class UpdateReplay : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPut("replay", async (UpdateReplayRequest request, ICommandHandler<UpdateReplayCommand, ReplayStatusDto> handler,
                CancellationToken cancellationToken) =>
            (await handler.Handle(new UpdateReplayCommand(request), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<ReplayStatusDto>()
            .RequireAuthorization(Permissions.RecordingsManage);
}
