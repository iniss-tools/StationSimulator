using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Settings;
using StationSimulator.Contracts.Settings;

namespace StationSimulator.Api.Settings;

/// <summary>PUT /api/settings - ulozi nastavenie servera.</summary>
public sealed class UpdateSettings : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPut("settings", async (UpdateSettingsRequest request, ICommandHandler<UpdateSettingsCommand, SettingsUpdatedDto> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new UpdateSettingsCommand(request), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<SettingsUpdatedDto>()
            .RequireAuthorization(Permissions.SettingsManage);
}
