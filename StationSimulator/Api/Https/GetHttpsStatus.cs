using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Https;
using StationSimulator.Contracts.Https;

namespace StationSimulator.Api.Https;

/// <summary>GET /api/https - stav HTTPS a certifikatu servera.</summary>
public sealed class GetHttpsStatus : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("https", async (IQueryHandler<GetHttpsStatusQuery, HttpsStatusDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetHttpsStatusQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<HttpsStatusDto>()
            .RequireAuthorization(Permissions.SettingsManage);
}
