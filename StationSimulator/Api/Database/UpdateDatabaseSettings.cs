using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Database;
using StationSimulator.Contracts.Database;

namespace StationSimulator.Api.Database;

/// <summary>PUT /api/database - zmena vyberu databazy; prejavi sa po restarte servera.</summary>
public sealed class UpdateDatabaseSettings : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPut("database", async (UpdateDatabaseRequest request, ICommandHandler<UpdateDatabaseSettingsCommand, DatabaseSettingsDto> handler,
                CancellationToken cancellationToken) =>
            (await handler.Handle(new UpdateDatabaseSettingsCommand(request), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<DatabaseSettingsDto>()
            .RequireAuthorization(Permissions.SettingsManage);
}
