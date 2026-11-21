using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Users;
using StationSimulator.Contracts.Users;

namespace StationSimulator.Api.Users;

/// <summary>POST /api/users/{userName}/password - nove heslo pouzivatela od spravcu.</summary>
public sealed class SetUserPassword : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("users/{userName}/password", async (string userName, SetPasswordRequest request, ICommandHandler<SetUserPasswordCommand> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new SetUserPasswordCommand(userName, request), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.UsersManage);
}
