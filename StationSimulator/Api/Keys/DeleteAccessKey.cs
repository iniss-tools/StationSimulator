using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Keys;

namespace StationSimulator.Api.Keys;

/// <summary>DELETE /api/keys/{id} - odstrani pristupovy kluc.</summary>
public sealed class DeleteAccessKey : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapDelete("keys/{id:guid}", async (Guid id, ICommandHandler<DeleteAccessKeyCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new DeleteAccessKeyCommand(id), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.KeysManage);
}
