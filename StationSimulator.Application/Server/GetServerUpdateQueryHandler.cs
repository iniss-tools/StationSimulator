using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Server;

namespace StationSimulator.Application.Server;

public sealed class GetServerUpdateQueryHandler(IServerUpdates updates) : IQueryHandler<GetServerUpdateQuery, ServerUpdateDto>
{
    public Task<Result<ServerUpdateDto>> Handle(GetServerUpdateQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(Result.Success(updates.Status));
}
