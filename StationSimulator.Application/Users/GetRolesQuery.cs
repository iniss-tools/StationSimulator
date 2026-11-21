using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Roles;

namespace StationSimulator.Application.Users;

/// <summary>Vsetky roly.</summary>
public sealed record GetRolesQuery : IQuery<IReadOnlyList<RoleDto>>;

public sealed class GetRolesQueryHandler(IRoleService roles) : IQueryHandler<GetRolesQuery, IReadOnlyList<RoleDto>>
{
    public async Task<Result<IReadOnlyList<RoleDto>>> Handle(GetRolesQuery query, CancellationToken cancellationToken) =>
        Result.Success(await roles.ListAsync(cancellationToken).ConfigureAwait(false));
}
