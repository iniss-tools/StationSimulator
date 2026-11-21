using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Core.Simulation;

namespace StationSimulator.Application.Boards;

public sealed class DeleteBoardCommandHandler(Simulator simulator) : ICommandHandler<DeleteBoardCommand>
{
    public Task<Result> Handle(DeleteBoardCommand command, CancellationToken cancellationToken) =>
        Task.FromResult(simulator.RemoveBoard(command.Id) ? Result.Success() : Result.Failure(BoardErrors.NotFound(command.Id)));
}
