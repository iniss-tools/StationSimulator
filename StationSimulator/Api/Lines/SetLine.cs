using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Lines;
using StationSimulator.Contracts.Lines;

namespace StationSimulator.Api.Lines;

/// <summary>PUT /api/lines/{number} - prida alebo zmeni linku.</summary>
public sealed class SetLine : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPut("lines/{number:int}", async (int number, SetLineRequest request, ICommandHandler<SetLineCommand> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new SetLineCommand(number, request), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.LinesManage);
}
