using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Users;
using StationSimulator.Contracts.Roles;

namespace StationSimulator.Api.Roles;

/// <summary>PUT /api/roles/{name} - zmeni nazov a opravnenia roly (vstavanej len opravnenia, spravcu nie).</summary>
public sealed class UpdateRole : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPut("roles/{name}", async (string name, SetRoleRequest request, ICommandHandler<UpdateRoleCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new UpdateRoleCommand(name, request), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.UsersManage);
}
