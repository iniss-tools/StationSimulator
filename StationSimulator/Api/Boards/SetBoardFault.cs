using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Boards;
using StationSimulator.Contracts.Boards;

namespace StationSimulator.Api.Boards;

/// <summary>POST /api/boards/{id}/fault - predstierana porucha tabule.</summary>
public sealed class SetBoardFault : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("boards/{id}/fault", async (string id, BoardFaultDto fault, ICommandHandler<SetBoardFaultCommand> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new SetBoardFaultCommand(id, fault), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.BoardsControl);
}
