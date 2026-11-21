using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Users;
using StationSimulator.Contracts.Users;

namespace StationSimulator.Api.Users;

/// <summary>PUT /api/users/{userName} - meno, rola a vypnutie pouzivatela.</summary>
public sealed class UpdateUser : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPut("users/{userName}", async (string userName, UpdateUserRequest request, ICommandHandler<UpdateUserCommand> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new UpdateUserCommand(userName, request), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.UsersManage);
}
