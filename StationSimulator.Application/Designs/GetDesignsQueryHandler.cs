using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Designs;

namespace StationSimulator.Application.Designs;

public sealed class GetDesignsQueryHandler(DesignCatalog designs) : IQueryHandler<GetDesignsQuery, DesignInfoDto[]>
{
    public Task<Result<DesignInfoDto[]>> Handle(GetDesignsQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(Result.Success(designs.List()));
}
