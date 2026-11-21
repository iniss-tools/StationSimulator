using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Boards;
using StationSimulator.Contracts.Boards;

namespace StationSimulator.Api.Boards;

/// <summary>PUT /api/boards/{line}/{address} - prida alebo zmeni tabulu.</summary>
public sealed class SetBoard : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPut("boards/{line:int}/{address:int}", async (int line, int address, SetBoardRequest request, ICommandHandler<SetBoardCommand> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new SetBoardCommand(line, address, request), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.LinesManage);
}
