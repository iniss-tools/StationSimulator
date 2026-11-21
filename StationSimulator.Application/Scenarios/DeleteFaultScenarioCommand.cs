using System.Globalization;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Audit;
using StationSimulator.Application.Live;
using StationSimulator.Contracts.Live;

namespace StationSimulator.Application.Scenarios;

/// <summary>Odstrani scenar porucha (beziaci zastavi).</summary>
public sealed record DeleteFaultScenarioCommand(int Id) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id.ToString(CultureInfo.InvariantCulture);
}

public sealed class DeleteFaultScenarioCommandHandler(IFaultScenarioRepository scenarios, ScenarioRunner runner, ILiveNotifier live)
    : ICommandHandler<DeleteFaultScenarioCommand>
{
    public async Task<Result> Handle(DeleteFaultScenarioCommand command, CancellationToken cancellationToken)
    {
        if (!await scenarios.DeleteAsync(command.Id, cancellationToken).ConfigureAwait(false))
            return Result.Failure(ScenarioErrors.NotFound(command.Id));
        await runner.StopAsync(command.Id).ConfigureAwait(false);
        live.Publish(new ScenariosMessage());
        return Result.Success();
    }
}
