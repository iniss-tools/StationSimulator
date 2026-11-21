using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Mapping;
using StationSimulator.Contracts.Keys;

namespace StationSimulator.Application.Keys;

public sealed class CreateAccessKeyCommandHandler(IAccessKeyRepository keys, ICurrentUser user, RoleCatalog roles, TimeProvider time)
    : ICommandHandler<CreateAccessKeyCommand, AccessKeyCreatedDto>
{
    public async Task<Result<AccessKeyCreatedDto>> Handle(CreateAccessKeyCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;
        var secret = AccessKeys.NewSecret();
        // zariadenie s klucom v odkaze smie len pozerat
        var role = request.Kind == AccessKeyKind.Device ? Roles.Viewer : request.Role;
        if (!roles.Covers(user.Role, roles.PermissionsOf(role)))
            return Result.Failure<AccessKeyCreatedDto>(KeyErrors.RoleTooHigh());
        var key = new AccessKey(Guid.NewGuid(), request.Name.Trim(), AccessKeys.KindOf(request.Kind), role, secret[..AccessKeys.PrefixLength],
            AccessKeys.Hash(secret), time.GetUtcNow().UtcDateTime, user.UserName ?? "-", null);
        await keys.AddAsync(key, cancellationToken).ConfigureAwait(false);
        return Result.Success(new AccessKeyCreatedDto(DtoMapper.ToDto(key), secret));
    }
}
