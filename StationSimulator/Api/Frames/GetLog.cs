using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Frames;
using StationSimulator.Contracts.Frames;

namespace StationSimulator.Api.Frames;

/// <summary>GET /api/log?after= - zaznamy komunikacie.</summary>
public sealed class GetLog : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("log", async (long? after, IQueryHandler<GetLogQuery, FrameDto[]> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetLogQuery(after ?? 0), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<FrameDto[]>()
            .RequireAuthorization(Permissions.LogView);
}
