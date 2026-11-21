using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Schemas;

namespace StationSimulator.Api.Schemas;

/// <summary>DELETE /api/schemas/{id} - odstrani schemu stanice.</summary>
public sealed class DeleteStationSchema : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapDelete("schemas/{id:int}", async (int id, ICommandHandler<DeleteStationSchemaCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new DeleteStationSchemaCommand(id), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.SchemasManage);
}
