using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Signage;

namespace StationSimulator.Api.Signage;

/// <summary>GET /api/signage/export - zaloha informacnych panelov (ZIP s definiciami a nahratymi subormi).</summary>
public sealed class ExportSignage : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("signage/export", async (IQueryHandler<ExportSignageQuery, SignageExportFile> handler, CancellationToken cancellationToken) =>
                (await handler.Handle(new ExportSignageQuery(), cancellationToken)).Match(
                    // docasny subor sa zmaze po odoslani
                    file => Results.File(new FileStream(file.Path, FileMode.Open, FileAccess.Read, FileShare.None, 81920, FileOptions.DeleteOnClose),
                        "application/zip", file.FileName),
                    CustomResults.Problem))
            .Produces(StatusCodes.Status200OK, contentType: "application/zip")
            .RequireAuthorization(Permissions.SimulatorView);
}
