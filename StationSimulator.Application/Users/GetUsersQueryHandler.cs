using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Users;

namespace StationSimulator.Application.Users;

public sealed class GetUsersQueryHandler(IUserService users) : IQueryHandler<GetUsersQuery, IReadOnlyList<UserDto>>
{
    public async Task<Result<IReadOnlyList<UserDto>>> Handle(GetUsersQuery query, CancellationToken cancellationToken) =>
        Result.Success(await users.ListAsync(cancellationToken).ConfigureAwait(false));
}
