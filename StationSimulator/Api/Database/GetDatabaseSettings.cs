using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Database;
using StationSimulator.Contracts.Database;

namespace StationSimulator.Api.Database;

/// <summary>GET /api/database - pouzivana a vybrana databaza (SQLite alebo PostgreSQL).</summary>
public sealed class GetDatabaseSettings : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("database", async (IQueryHandler<GetDatabaseSettingsQuery, DatabaseSettingsDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetDatabaseSettingsQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<DatabaseSettingsDto>()
            .RequireAuthorization(Permissions.SettingsManage);
}
