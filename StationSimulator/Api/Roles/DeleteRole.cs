using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Users;

namespace StationSimulator.Api.Roles;

/// <summary>DELETE /api/roles/{name} - odstrani vlastnu rolu, ktoru nema ziaden pouzivatel ani kluc.</summary>
public sealed class DeleteRole : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapDelete("roles/{name}", async (string name, ICommandHandler<DeleteRoleCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new DeleteRoleCommand(name), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.UsersManage);
}
