using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Users;
using StationSimulator.Contracts.Users;

namespace StationSimulator.Api.Users;

/// <summary>GET /api/users - pouzivatelia.</summary>
public sealed class GetUsers : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapGet("users", async (IQueryHandler<GetUsersQuery, IReadOnlyList<UserDto>> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new GetUsersQuery(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<IReadOnlyList<UserDto>>()
            .RequireAuthorization(Permissions.UsersManage);
}
