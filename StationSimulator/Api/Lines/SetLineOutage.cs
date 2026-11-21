using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Lines;
using StationSimulator.Contracts.Lines;

namespace StationSimulator.Api.Lines;

/// <summary>POST /api/lines/{number}/outage - rucny vypadok linky alebo jeho koniec.</summary>
public sealed class SetLineOutage : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("lines/{number:int}/outage", async (int number, SetLineOutageRequest request, ICommandHandler<SetLineOutageCommand> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new SetLineOutageCommand(number, request.Outage), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.BoardsControl);
}
