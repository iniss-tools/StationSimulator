using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Virtual;
using StationSimulator.Contracts.Virtual;

namespace StationSimulator.Api.Virtual;

/// <summary>GET /api/virtual/{id} - co ukazuje virtualna tabula.</summary>
public sealed class GetVirtualView : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("virtual/{id:int}", async (int id, IQueryHandler<GetVirtualViewQuery, VirtualViewDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetVirtualViewQuery(id), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<VirtualViewDto>()
            .RequireAuthorization(Permissions.SimulatorView);
}
