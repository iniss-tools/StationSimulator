using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Schemas;

namespace StationSimulator.Api.Schemas;

/// <summary>DELETE /api/schemas/{id}/background - odstrani obrazok pozadia schemy.</summary>
public sealed class DeleteSchemaBackground : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapDelete("schemas/{id:int}/background", async (int id, ICommandHandler<DeleteSchemaBackgroundCommand> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new DeleteSchemaBackgroundCommand(id), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.SchemasManage);
}
