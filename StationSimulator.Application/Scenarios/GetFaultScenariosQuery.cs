using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Scenarios;

namespace StationSimulator.Application.Scenarios;

/// <summary>Scenare porucha s behom.</summary>
public sealed record GetFaultScenariosQuery : IQuery<IReadOnlyList<FaultScenarioDto>>;

public sealed class GetFaultScenariosQueryHandler(IFaultScenarioRepository scenarios, ScenarioRunner runner)
    : IQueryHandler<GetFaultScenariosQuery, IReadOnlyList<FaultScenarioDto>>
{
    public async Task<Result<IReadOnlyList<FaultScenarioDto>>> Handle(GetFaultScenariosQuery query, CancellationToken cancellationToken)
    {
        var records = await scenarios.ListAsync(cancellationToken).ConfigureAwait(false);
        return Result.Success<IReadOnlyList<FaultScenarioDto>>(records.Select(r => ScenarioMapping.ToDto(r, runner.Status(r.Id))).ToList());
    }
}
