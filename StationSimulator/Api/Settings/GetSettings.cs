using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Settings;
using StationSimulator.Contracts.Settings;

namespace StationSimulator.Api.Settings;

/// <summary>GET /api/settings - nastavenie servera.</summary>
public sealed class GetSettings : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("settings", async (IQueryHandler<GetSettingsQuery, SettingsDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetSettingsQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<SettingsDto>()
            .RequireAuthorization(Permissions.SimulatorView);
}
