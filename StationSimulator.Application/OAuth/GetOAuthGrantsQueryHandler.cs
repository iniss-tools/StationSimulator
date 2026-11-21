using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Mapping;
using StationSimulator.Contracts.OAuth;

namespace StationSimulator.Application.OAuth;

public sealed class GetOAuthGrantsQueryHandler(IOAuthRepository repository, ICurrentUser user, RoleCatalog roles)
    : IQueryHandler<GetOAuthGrantsQuery, IReadOnlyList<OAuthGrantDto>>
{
    public async Task<Result<IReadOnlyList<OAuthGrantDto>>> Handle(GetOAuthGrantsQuery query, CancellationToken cancellationToken)
    {
        var all = roles.Has(user.Role, Permissions.KeysManage);
        var grants = await repository.ListGrantsAsync(cancellationToken).ConfigureAwait(false);
        return Result.Success<IReadOnlyList<OAuthGrantDto>>(grants.Where(g => all || g.UserName == user.UserName).Select(g => DtoMapper.ToDto(g, roles.Find(g.Role)?.DisplayName ?? "")).ToArray());
    }
}
