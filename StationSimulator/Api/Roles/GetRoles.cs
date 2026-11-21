using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Users;
using StationSimulator.Contracts.Roles;

namespace StationSimulator.Api.Roles;

/// <summary>GET /api/roles - vsetky roly s opravneniami a poctom pouzivatelov a klucov (aj pre spravu klucov).</summary>
public sealed class GetRoles : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("roles", async (IQueryHandler<GetRolesQuery, IReadOnlyList<RoleDto>> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetRolesQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<IReadOnlyList<RoleDto>>()
            .RequireAuthorization(Policies.RolesView);
}
