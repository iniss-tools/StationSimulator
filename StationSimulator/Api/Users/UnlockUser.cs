using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Users;

namespace StationSimulator.Api.Users;

/// <summary>POST /api/users/{userName}/unlock - zrusi zablokovanie po neuspesnych pokusoch.</summary>
public sealed class UnlockUser : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("users/{userName}/unlock", async (string userName, ICommandHandler<UnlockUserCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new UnlockUserCommand(userName), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.UsersManage);
}
