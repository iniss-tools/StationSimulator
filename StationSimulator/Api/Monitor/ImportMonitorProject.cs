using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Monitor;
using StationSimulator.Contracts.Monitor;

namespace StationSimulator.Api.Monitor;

/// <summary>POST /api/monitor/import - tabule z projektu ELEN Monitora.</summary>
public sealed class ImportMonitorProject : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("monitor/import", async (MonitorImportRequest request, ICommandHandler<ImportMonitorProjectCommand, MonitorImportedDto> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new ImportMonitorProjectCommand(request.Project, request.Line), cancellationToken))
            .Match(Results.Ok, CustomResults.Problem))
            .Produces<MonitorImportedDto>()
            .RequireAuthorization(Permissions.LinesManage);
}
