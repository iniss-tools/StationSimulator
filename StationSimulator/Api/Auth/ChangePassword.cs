using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Users;
using StationSimulator.Contracts.Users;

namespace StationSimulator.Api.Auth;

/// <summary>POST /api/auth/password - zmena vlastneho hesla (kazdy prihlaseny).</summary>
public sealed class ChangePassword : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("auth/password", async (ChangePasswordRequest request, ICommandHandler<ChangePasswordCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new ChangePasswordCommand(request), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.SimulatorView);
}
