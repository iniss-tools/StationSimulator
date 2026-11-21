using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Database;
using StationSimulator.Contracts.Database;

namespace StationSimulator.Api.Database;

/// <summary>POST /api/database/test - skuska pripojenia k PostgreSQL podla formulara.</summary>
public sealed class TestDatabase : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("database/test", async (PostgresSettingsRequest request, ICommandHandler<TestDatabaseCommand, DatabaseTestResultDto> handler,
                CancellationToken cancellationToken) =>
            (await handler.Handle(new TestDatabaseCommand(request), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<DatabaseTestResultDto>()
            .RequireAuthorization(Permissions.SettingsManage);
}
