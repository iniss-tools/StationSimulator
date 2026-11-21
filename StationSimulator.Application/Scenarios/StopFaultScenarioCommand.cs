using System.Globalization;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Audit;

namespace StationSimulator.Application.Scenarios;

/// <summary>Zastavi scenar porucha a vrati, co nastavil.</summary>
public sealed record StopFaultScenarioCommand(int Id) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id.ToString(CultureInfo.InvariantCulture);
}

public sealed class StopFaultScenarioCommandHandler(ScenarioRunner runner) : ICommandHandler<StopFaultScenarioCommand>
{
    public async Task<Result> Handle(StopFaultScenarioCommand command, CancellationToken cancellationToken)
    {
        await runner.StopAsync(command.Id).ConfigureAwait(false);
        return Result.Success();
    }
}
