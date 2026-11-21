using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Mapping;
using StationSimulator.Contracts.Frames;
using StationSimulator.Core.Simulation;

namespace StationSimulator.Application.Frames;

public sealed class GetLogQueryHandler(Simulator simulator) : IQueryHandler<GetLogQuery, FrameDto[]>
{
    public Task<Result<FrameDto[]>> Handle(GetLogQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(Result.Success(simulator.LogSince(query.After).Select(DtoMapper.ToDto).ToArray()));
}
