using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Scenarios;

namespace StationSimulator.Api.Scenarios;

/// <summary>DELETE /api/scenarios/{id} - odstrani scenar porucha (beziaci zastavi).</summary>
public sealed class DeleteFaultScenario : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapDelete("scenarios/{id:int}", async (int id, ICommandHandler<DeleteFaultScenarioCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new DeleteFaultScenarioCommand(id), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.ScenariosManage);
}
