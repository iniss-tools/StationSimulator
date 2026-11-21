using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Scenarios;

namespace StationSimulator.Api.Scenarios;

/// <summary>POST /api/scenarios/{id}/stop - zastavi scenar porucha a vrati, co nastavil.</summary>
public sealed class StopFaultScenario : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("scenarios/{id:int}/stop", async (int id, ICommandHandler<StopFaultScenarioCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new StopFaultScenarioCommand(id), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.ScenariosManage);
}
