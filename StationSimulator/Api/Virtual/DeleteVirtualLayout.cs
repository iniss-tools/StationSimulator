using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Virtual;

namespace StationSimulator.Api.Virtual;

/// <summary>DELETE /api/virtual/layouts/{id} - odstrani vlastne rozlozenie, ktore ziadna tabula nepouziva.</summary>
public sealed class DeleteVirtualLayout : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapDelete("virtual/layouts/{id}", async (string id, ICommandHandler<DeleteVirtualLayoutCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new DeleteVirtualLayoutCommand(id), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.VirtualManage);
}
