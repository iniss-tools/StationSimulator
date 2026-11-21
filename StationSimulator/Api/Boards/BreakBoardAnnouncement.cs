using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Boards;

namespace StationSimulator.Api.Boards;

/// <summary>POST /api/boards/{id}/remote-audio/break?queue= - prerusi hlasenie rozhlasu vzdialeneho INISSu (fronta volitelna).</summary>
public sealed class BreakBoardAnnouncement : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("boards/{id}/remote-audio/break", async (string id, string? queue, ICommandHandler<BreakAnnouncementCommand> handler,
                CancellationToken cancellationToken) =>
            (await handler.Handle(new BreakAnnouncementCommand(id, queue), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.BoardsControl);
}
