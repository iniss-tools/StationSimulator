using System.Text;
using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Config;

namespace StationSimulator.Api.Config;

/// <summary>GET /api/config - linky a tabule ako subor JSON na stiahnutie.</summary>
public sealed class ExportConfig : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("config", async (IQueryHandler<ExportConfigQuery, ConfigFile> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new ExportConfigQuery(), cancellationToken))
            .Match(file => Results.File(Encoding.UTF8.GetBytes(file.Content), "application/json", file.FileName), CustomResults.Problem))
            .Produces(StatusCodes.Status200OK, contentType: "application/json")
            .RequireAuthorization(Permissions.SimulatorView);
}
