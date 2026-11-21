using System.Globalization;
using FluentValidation;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Audit;
using StationSimulator.Application.Live;
using StationSimulator.Contracts.Live;
using StationSimulator.Contracts.Scenarios;

namespace StationSimulator.Application.Scenarios;

/// <summary>Zmeni scenar porucha; beziaci pokracuje s novymi krokmi.</summary>
public sealed record SetFaultScenarioCommand(int Id, FaultScenarioRequest Request) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id.ToString(CultureInfo.InvariantCulture);
}

public sealed class SetFaultScenarioCommandValidator : AbstractValidator<SetFaultScenarioCommand>
{
    public SetFaultScenarioCommandValidator()
    {
        RuleFor(c => c.Request).NotNull().WithErrorCode(ScenarioErrors.Name).SetValidator(new FaultScenarioRequestValidator());
    }
}

public sealed class SetFaultScenarioCommandHandler(IFaultScenarioRepository scenarios, ScenarioRunner runner, ILiveNotifier live)
    : ICommandHandler<SetFaultScenarioCommand>
{
    public async Task<Result> Handle(SetFaultScenarioCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request with { Name = command.Request.Name.Trim() };
        if (!await scenarios.UpdateAsync(new FaultScenarioRecord(command.Id, request.Name, ScenarioMapping.Serialize(request)), cancellationToken)
                .ConfigureAwait(false))
            return Result.Failure(ScenarioErrors.NotFound(command.Id));
        await runner.ReplaceAsync(command.Id, ScenarioMapping.ToCore(request)).ConfigureAwait(false);
        live.Publish(new ScenariosMessage());
        return Result.Success();
    }
}
