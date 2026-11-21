using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Core.Simulation;

namespace StationSimulator.Application.Boards;

public sealed class ClearBoardCommandHandler(Simulator simulator) : ICommandHandler<ClearBoardCommand>
{
    public Task<Result> Handle(ClearBoardCommand command, CancellationToken cancellationToken) =>
        Task.FromResult(simulator.ClearBoard(command.Id) ? Result.Success() : Result.Failure(BoardErrors.NotFound(command.Id)));
}
