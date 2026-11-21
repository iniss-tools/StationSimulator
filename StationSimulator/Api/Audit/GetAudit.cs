using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Audit;

namespace StationSimulator.Api.Audit;

/// <summary>GET /api/audit?before=&amp;user=&amp;action=&amp;limit= - audit od najnovsich zaznamov.</summary>
public sealed class GetAudit : IEndpoint
{
    private const int DefaultLimit = 100;

    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("audit", async (long? before, string? user, string? action, int? limit, IQueryHandler<GetAuditQuery, AuditPageDto> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new GetAuditQuery(before, user, action, limit ?? DefaultLimit), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<AuditPageDto>()
            .RequireAuthorization(Permissions.AuditView);
}
