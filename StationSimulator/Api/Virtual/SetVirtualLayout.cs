using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Virtual;
using StationSimulator.Contracts.Virtual;

namespace StationSimulator.Api.Virtual;

/// <summary>PUT /api/virtual/layouts/{id} - zalozi alebo zmeni vlastne rozlozenie virtualnych tabul.</summary>
public sealed class SetVirtualLayout : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPut("virtual/layouts/{id}", async (string id, VirtualLayoutDto layout, ICommandHandler<SetVirtualLayoutCommand> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new SetVirtualLayoutCommand(id, layout), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.VirtualManage);
}
