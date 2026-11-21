using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Audit;
using StationSimulator.Application.Scenarios;
using StationSimulator.Core.Simulation;

namespace StationSimulator.Application.Boards;

/// <summary>
/// Rucne vypne alebo zapne napajanie tabule: vypnuta neodpoveda a po zapnuti je prazdna. Vypadok sa neuklada a plati
/// popri scenaroch poruch.
/// </summary>
public sealed record SetBoardPowerCommand(string Id, bool On) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id;
}

public sealed class SetBoardPowerCommandHandler(Simulator simulator, ScenarioRunner runner) : ICommandHandler<SetBoardPowerCommand>
{
    public async Task<Result> Handle(SetBoardPowerCommand command, CancellationToken cancellationToken)
    {
        if (!simulator.Read(s => s.Boards.Any(b => b.Id == command.Id)))
            return Result.Failure(BoardErrors.NotFound(command.Id));
        await runner.SetManualPowerAsync(command.Id, !command.On).ConfigureAwait(false);
        return Result.Success();
    }
}
