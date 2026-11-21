using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Boards;
using StationSimulator.Contracts.Boards;

namespace StationSimulator.Api.Boards;

/// <summary>GET /api/boards/{id} - tabula.</summary>
public sealed class GetBoard : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("boards/{id}", async (string id, IQueryHandler<GetBoardQuery, BoardDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetBoardQuery(id), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<BoardDto>()
            .RequireAuthorization(Permissions.SimulatorView);
}
