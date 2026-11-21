using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Schemas;
using StationSimulator.Contracts.Schemas;

namespace StationSimulator.Api.Schemas;

/// <summary>PUT /api/schemas/{id}/background?name= - obrazok pozadia schemy (telo = subor, typ podla pripony mena).</summary>
public sealed class SetSchemaBackground : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPut("schemas/{id:int}/background", async (int id, string? name, HttpRequest request,
            ICommandHandler<SetSchemaBackgroundCommand, SchemaBackgroundDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new SetSchemaBackgroundCommand(id, name ?? "", request.Body), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Accepts<Stream>("application/octet-stream")
            .Produces<SchemaBackgroundDto>()
            .RequireAuthorization(Permissions.SchemasManage);
}
