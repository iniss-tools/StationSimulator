using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Schemas;
using StationSimulator.Contracts.Schemas;

namespace StationSimulator.Api.Schemas;

/// <summary>PUT /api/schemas/{id} - zmeni schemu stanice.</summary>
public sealed class SetStationSchema : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPut("schemas/{id:int}", async (int id, StationSchemaRequest request, ICommandHandler<SetStationSchemaCommand> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new SetStationSchemaCommand(id, request), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.SchemasManage);
}
