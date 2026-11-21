using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Alerts;
using StationSimulator.Application.Auth;
using StationSimulator.Contracts.Settings;

namespace StationSimulator.Api.Settings;

/// <summary>POST /api/settings/alerts/test - skusobne oznamenie podla nastavenia z formulara.</summary>
public sealed class TestAlerts : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("settings/alerts/test", async (AlertSettingsRequest request, ICommandHandler<TestAlertsCommand, AlertTestResultDto> handler,
                CancellationToken cancellationToken) =>
            (await handler.Handle(new TestAlertsCommand(request), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<AlertTestResultDto>()
            .RequireAuthorization(Permissions.SettingsManage);
}
