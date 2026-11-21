using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Boards;
using StationSimulator.Contracts.Boards;

namespace StationSimulator.Api.Boards;

/// <summary>POST /api/boards/{id}/power - rucny vypadok napajania tabule alebo jeho koniec.</summary>
public sealed class SetBoardPower : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("boards/{id}/power", async (string id, SetBoardPowerRequest request, ICommandHandler<SetBoardPowerCommand> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new SetBoardPowerCommand(id, request.On), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.BoardsControl);
}
