using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Schemas;
using StationSimulator.Contracts.Schemas;

namespace StationSimulator.Api.Schemas;

/// <summary>GET /api/schemas - schemy stanice.</summary>
public sealed class GetStationSchemas : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("schemas", async (IQueryHandler<GetStationSchemasQuery, IReadOnlyList<StationSchemaDto>> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetStationSchemasQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<IReadOnlyList<StationSchemaDto>>()
            .RequireAuthorization(Permissions.SimulatorView);
}
