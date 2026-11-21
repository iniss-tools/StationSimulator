using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Users;
using StationSimulator.Contracts.Roles;

namespace StationSimulator.Api.Roles;

/// <summary>POST /api/roles - zalozi vlastnu rolu.</summary>
public sealed class CreateRole : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("roles", async (SetRoleRequest request, ICommandHandler<CreateRoleCommand, RoleCreatedDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new CreateRoleCommand(request), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<RoleCreatedDto>()
            .RequireAuthorization(Permissions.UsersManage);
}
