using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Frames;

namespace StationSimulator.Api.Frames;

/// <summary>DELETE /api/log - vymaze zaznam komunikacie.</summary>
public sealed class ClearLog : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapDelete("log", async (ICommandHandler<ClearLogCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new ClearLogCommand(), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.BoardsControl);
}
