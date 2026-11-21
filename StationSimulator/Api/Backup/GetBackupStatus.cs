using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Backup;
using StationSimulator.Contracts.Backup;

namespace StationSimulator.Api.Backup;

/// <summary>GET /api/backup - pripravena obnova a ci server bezi ako sluzba (restart z webu).</summary>
public sealed class GetBackupStatus : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("backup", async (IQueryHandler<GetBackupStatusQuery, BackupStatusDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetBackupStatusQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<BackupStatusDto>()
            .RequireAuthorization(Permissions.ServerManage);
}
