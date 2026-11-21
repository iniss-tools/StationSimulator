using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Scenarios;

namespace StationSimulator.Api.Scenarios;

/// <summary>POST /api/scenarios/{id}/start - spusti scenar porucha od zaciatku.</summary>
public sealed class StartFaultScenario : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("scenarios/{id:int}/start", async (int id, ICommandHandler<StartFaultScenarioCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new StartFaultScenarioCommand(id), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.ScenariosManage);
}
