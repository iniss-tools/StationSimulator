using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Core.Simulation;
using StationSimulator.Core.Transport;

namespace StationSimulator.Application.Lines;

public sealed class DeleteLineCommandHandler(Simulator simulator, TransportManager transport) : ICommandHandler<DeleteLineCommand>
{
    public async Task<Result> Handle(DeleteLineCommand command, CancellationToken cancellationToken)
    {
        if (!simulator.RemoveLine(command.Number))
            return Result.Failure(LineErrors.NotFound(command.Number));
        await transport.SyncAsync().ConfigureAwait(false);
        return Result.Success();
    }
}
