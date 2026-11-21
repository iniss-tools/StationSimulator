using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Backup;

namespace StationSimulator.Api.Backup;

/// <summary>GET /api/backup/file?recordings= - zaloha celeho simulatora (ZIP s databazou, vzhladmi a subormi panelov).</summary>
public sealed class CreateBackup : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("backup/file", async (bool? recordings, IQueryHandler<CreateBackupQuery, BackupFile> handler, CancellationToken cancellationToken) =>
                (await handler.Handle(new CreateBackupQuery(recordings ?? false), cancellationToken)).Match(
                    // docasny subor sa zmaze po odoslani
                    file => Results.File(new FileStream(file.Path, FileMode.Open, FileAccess.Read, FileShare.None, 81920, FileOptions.DeleteOnClose),
                        "application/zip", file.FileName),
                    CustomResults.Problem))
            .Produces(StatusCodes.Status200OK, contentType: "application/zip")
            .RequireAuthorization(Permissions.ServerManage);
}
