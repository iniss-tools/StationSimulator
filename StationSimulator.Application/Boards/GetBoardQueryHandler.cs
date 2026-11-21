using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Mapping;
using StationSimulator.Contracts.Boards;
using StationSimulator.Core.Simulation;

namespace StationSimulator.Application.Boards;

public sealed class GetBoardQueryHandler(Simulator simulator) : IQueryHandler<GetBoardQuery, BoardDto>
{
    public Task<Result<BoardDto>> Handle(GetBoardQuery query, CancellationToken cancellationToken)
    {
        var board = simulator.Read(s => s.FindBoard(query.Id) is { } b ? DtoMapper.ToDto(b) : null);
        return Task.FromResult(board is null ? Result.Failure<BoardDto>(BoardErrors.NotFound(query.Id)) : Result.Success(board));
    }
}
