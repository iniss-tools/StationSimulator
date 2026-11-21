using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Boards;

namespace StationSimulator.Api.Boards;

/// <summary>DELETE /api/boards/{id} - odstrani tabulu.</summary>
public sealed class DeleteBoard : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapDelete("boards/{id}", async (string id, ICommandHandler<DeleteBoardCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new DeleteBoardCommand(id), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.LinesManage);
}
