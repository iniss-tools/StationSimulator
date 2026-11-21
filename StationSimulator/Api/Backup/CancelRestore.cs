using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Backup;

namespace StationSimulator.Api.Backup;

/// <summary>DELETE /api/backup/restore - zrusi pripravenu obnovu.</summary>
public sealed class CancelRestore : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapDelete("backup/restore", async (ICommandHandler<CancelRestoreCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new CancelRestoreCommand(), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.ServerManage);
}
