using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Boards;

namespace StationSimulator.Api.Boards;

/// <summary>POST /api/boards/{id}/clear - zmaze obsah tabule.</summary>
public sealed class ClearBoard : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("boards/{id}/clear", async (string id, ICommandHandler<ClearBoardCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new ClearBoardCommand(id), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.BoardsControl);
}
