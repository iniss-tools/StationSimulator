using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Core.Simulation;

namespace StationSimulator.Application.Frames;

public sealed class ClearLogCommandHandler(Simulator simulator) : ICommandHandler<ClearLogCommand>
{
    public Task<Result> Handle(ClearLogCommand command, CancellationToken cancellationToken)
    {
        simulator.ClearLog();
        return Task.FromResult(Result.Success());
    }
}
