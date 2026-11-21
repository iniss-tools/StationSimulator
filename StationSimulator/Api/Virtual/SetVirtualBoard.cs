using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Virtual;
using StationSimulator.Contracts.Virtual;

namespace StationSimulator.Api.Virtual;

/// <summary>PUT /api/virtual/{id} - zalozi alebo zmeni virtualnu tabulu.</summary>
public sealed class SetVirtualBoard : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPut("virtual/{id:int}", async (int id, SetVirtualBoardRequest request, ICommandHandler<SetVirtualBoardCommand> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new SetVirtualBoardCommand(id, request), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.VirtualManage);
}
