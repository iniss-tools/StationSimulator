using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Designs;
using StationSimulator.Contracts.Designs;

namespace StationSimulator.Api.Designs;

/// <summary>PUT /api/designs/{id} - ulozi vlastny vzhlad tabule (design.json).</summary>
public sealed class SetDesign : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPut("designs/{id}", async (string id, SetDesignRequest request, ICommandHandler<SetDesignCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new SetDesignCommand(id, request), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(204)
            .RequireAuthorization(Permissions.DesignsManage);
}
