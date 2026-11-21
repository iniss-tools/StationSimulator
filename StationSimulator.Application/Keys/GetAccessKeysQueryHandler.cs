using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Mapping;
using StationSimulator.Contracts.Keys;

namespace StationSimulator.Application.Keys;

public sealed class GetAccessKeysQueryHandler(IAccessKeyRepository keys) : IQueryHandler<GetAccessKeysQuery, IReadOnlyList<AccessKeyDto>>
{
    public async Task<Result<IReadOnlyList<AccessKeyDto>>> Handle(GetAccessKeysQuery query, CancellationToken cancellationToken) =>
        Result.Success<IReadOnlyList<AccessKeyDto>>((await keys.ListAsync(cancellationToken).ConfigureAwait(false)).Select(DtoMapper.ToDto).ToArray());
}
