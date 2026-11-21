using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Mapping;
using StationSimulator.Core.Simulation;

namespace StationSimulator.Application.Boards;

public sealed class SetBoardFaultCommandHandler(Simulator simulator) : ICommandHandler<SetBoardFaultCommand>
{
    public Task<Result> Handle(SetBoardFaultCommand command, CancellationToken cancellationToken) =>
        Task.FromResult(simulator.SetFault(command.Id, RequestMapper.ToFault(command.Fault))
            ? Result.Success()
            : Result.Failure(BoardErrors.NotFound(command.Id)));
}
