using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Statistics;
using StationSimulator.Contracts.Statistics;

namespace StationSimulator.Api.Statistics;

/// <summary>GET /api/statistics?from=&amp;to=&amp;line= - statistika komunikacie za obdobie (linka volitelna).</summary>
public sealed class GetTrafficStatistics : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("statistics", async (DateTimeOffset from, DateTimeOffset to, int? line,
            IQueryHandler<GetTrafficStatisticsQuery, TrafficStatisticsDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetTrafficStatisticsQuery(from, to, line), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<TrafficStatisticsDto>()
            .RequireAuthorization(Permissions.StatisticsView);
}
