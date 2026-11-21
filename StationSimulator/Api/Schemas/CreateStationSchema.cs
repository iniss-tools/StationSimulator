using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Schemas;
using StationSimulator.Contracts.Schemas;

namespace StationSimulator.Api.Schemas;

/// <summary>POST /api/schemas - nova schema stanice.</summary>
public sealed class CreateStationSchema : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("schemas", async (StationSchemaRequest request, ICommandHandler<CreateStationSchemaCommand, StationSchemaDto> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new CreateStationSchemaCommand(request), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<StationSchemaDto>()
            .RequireAuthorization(Permissions.SchemasManage);
}
