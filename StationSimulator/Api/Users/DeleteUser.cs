using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Users;

namespace StationSimulator.Api.Users;

/// <summary>DELETE /api/users/{userName} - odstrani pouzivatela.</summary>
public sealed class DeleteUser : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapDelete("users/{userName}", async (string userName, ICommandHandler<DeleteUserCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new DeleteUserCommand(userName), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.UsersManage);
}
