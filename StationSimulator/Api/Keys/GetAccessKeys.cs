using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Keys;
using StationSimulator.Contracts.Keys;

namespace StationSimulator.Api.Keys;

/// <summary>GET /api/keys - pristupove kluce bez tajnych hodnot.</summary>
public sealed class GetAccessKeys : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("keys", async (IQueryHandler<GetAccessKeysQuery, IReadOnlyList<AccessKeyDto>> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetAccessKeysQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<IReadOnlyList<AccessKeyDto>>()
            .RequireAuthorization(Permissions.KeysManage);
}
