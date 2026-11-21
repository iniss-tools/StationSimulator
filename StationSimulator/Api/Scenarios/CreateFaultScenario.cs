using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Scenarios;
using StationSimulator.Contracts.Scenarios;

namespace StationSimulator.Api.Scenarios;

/// <summary>POST /api/scenarios - novy scenar porucha.</summary>
public sealed class CreateFaultScenario : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("scenarios", async (FaultScenarioRequest request, ICommandHandler<CreateFaultScenarioCommand, FaultScenarioDto> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new CreateFaultScenarioCommand(request), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<FaultScenarioDto>()
            .RequireAuthorization(Permissions.ScenariosManage);
}
