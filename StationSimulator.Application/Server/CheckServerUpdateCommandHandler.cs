using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Server;

namespace StationSimulator.Application.Server;

public sealed class CheckServerUpdateCommandHandler(IServerUpdates updates) : ICommandHandler<CheckServerUpdateCommand, ServerUpdateDto>
{
    public async Task<Result<ServerUpdateDto>> Handle(CheckServerUpdateCommand command, CancellationToken cancellationToken) =>
        Result.Success(await updates.CheckAsync(cancellationToken).ConfigureAwait(false));
}
