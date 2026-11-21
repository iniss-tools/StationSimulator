using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Archive;
using StationSimulator.Application.Auth;
using StationSimulator.Contracts.Archive;

namespace StationSimulator.Api.Archive;

/// <summary>GET /api/archive/tables/{datum}?train=&amp;text=&amp;newest=&amp;offset=&amp;limit= - stranka archivu jedneho dna.</summary>
public sealed class GetTableArchive : IEndpoint
{
    private const int DefaultLimit = 200;

    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("archive/tables/{date}", async (DateOnly date, string? train, string? text, bool? newest, int? offset, int? limit,
            IQueryHandler<GetTableArchiveQuery, TableArchivePageDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetTableArchiveQuery(date, train, text, newest ?? false, offset ?? 0, limit ?? DefaultLimit), cancellationToken))
            .Match(Results.Ok, CustomResults.Problem))
            .Produces<TableArchivePageDto>()
            .RequireAuthorization(Permissions.ArchiveView);
}
