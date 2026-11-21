using Microsoft.AspNetCore.Routing;
using Microsoft.Net.Http.Headers;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Schemas;

namespace StationSimulator.Api.Schemas;

/// <summary>
/// GET /api/schemas/{id}/background - obrazok pozadia schemy. Stranka ho nacita s verziou v parametri <c>v</c>, preto
/// sa da drzat vo vyrovnavacej pamati.
/// </summary>
public sealed class GetSchemaBackground : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("schemas/{id:int}/background", async (int id, HttpContext context, IQueryHandler<GetSchemaBackgroundQuery, SchemaBackgroundFile> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new GetSchemaBackgroundQuery(id), cancellationToken)).Match(file =>
            {
                // obsah pod verziou sa nemeni
                context.Response.Headers[HeaderNames.CacheControl] = "private, max-age=86400, immutable";
                return Results.File(file.Data, file.ContentType);
            }, CustomResults.Problem))
            .Produces(StatusCodes.Status200OK, contentType: "application/octet-stream")
            .RequireAuthorization(Permissions.SimulatorView);
}
