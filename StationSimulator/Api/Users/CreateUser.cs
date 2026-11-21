using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Users;
using StationSimulator.Contracts.Users;

namespace StationSimulator.Api.Users;

/// <summary>POST /api/users - novy pouzivatel.</summary>
public sealed class CreateUser : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("users", async (CreateUserRequest request, ICommandHandler<CreateUserCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new CreateUserCommand(request), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.UsersManage);
}
