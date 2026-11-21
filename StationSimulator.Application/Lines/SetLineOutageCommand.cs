using System.Globalization;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Audit;
using StationSimulator.Application.Scenarios;
using StationSimulator.Core.Simulation;

namespace StationSimulator.Application.Lines;

/// <summary>
/// Rucne zapne alebo vypne vypadok linky: spojenie s INISSom sa zavrie a nove sa neprijima. Vypadok sa neuklada a plati
/// popri scenaroch poruch.
/// </summary>
public sealed record SetLineOutageCommand(int Number, bool Outage) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Number.ToString(CultureInfo.InvariantCulture);
}

public sealed class SetLineOutageCommandHandler(Simulator simulator, ScenarioRunner runner) : ICommandHandler<SetLineOutageCommand>
{
    public async Task<Result> Handle(SetLineOutageCommand command, CancellationToken cancellationToken)
    {
        if (!simulator.Read(s => s.Lines.Any(l => l.Number == command.Number)))
            return Result.Failure(LineErrors.NotFound(command.Number));
        await runner.SetManualOutageAsync(command.Number, command.Outage).ConfigureAwait(false);
        return Result.Success();
    }
}
