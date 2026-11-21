using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Mapping;
using StationSimulator.Core.Simulation;
using StationSimulator.Core.Transport;

namespace StationSimulator.Application.Lines;

public sealed class SetLineCommandHandler(Simulator simulator, TransportManager transport) : ICommandHandler<SetLineCommand>
{
    public async Task<Result> Handle(SetLineCommand command, CancellationToken cancellationToken)
    {
        try
        {
            simulator.SetLine(RequestMapper.ToConfig(command.Request, command.Number));
        }
        catch (ArgumentException e)
        {
            return Result.Failure(LineErrors.Invalid(e.Message));
        }

        await transport.SyncAsync().ConfigureAwait(false);
        return Result.Success();
    }
}
