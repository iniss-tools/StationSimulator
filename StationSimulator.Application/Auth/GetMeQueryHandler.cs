using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Auth;

namespace StationSimulator.Application.Auth;

public sealed class GetMeQueryHandler(IAuthService auth, ICurrentUser user, RoleCatalog roles) : IQueryHandler<GetMeQuery, MeDto>
{
    public async Task<Result<MeDto>> Handle(GetMeQuery query, CancellationToken cancellationToken)
    {
        var setup = auth.LoginRequired && !await auth.HasAdminAsync(cancellationToken).ConfigureAwait(false);
        return Result.Success(MeFactory.Create(roles, auth.LoginRequired, setup, user));
    }
}
