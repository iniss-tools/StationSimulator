using FluentValidation;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Audit;
using StationSimulator.Application.Live;
using StationSimulator.Contracts.Live;
using StationSimulator.Contracts.Scenarios;

namespace StationSimulator.Application.Scenarios;

/// <summary>Zalozi scenar porucha.</summary>
public sealed record CreateFaultScenarioCommand(FaultScenarioRequest Request) : ICommand<FaultScenarioDto>, IAuditable
{
    string IAuditable.AuditTarget => Request.Name;
}

public sealed class CreateFaultScenarioCommandValidator : AbstractValidator<CreateFaultScenarioCommand>
{
    public CreateFaultScenarioCommandValidator()
    {
        RuleFor(c => c.Request).NotNull().WithErrorCode(ScenarioErrors.Name).SetValidator(new FaultScenarioRequestValidator());
    }
}

public sealed class CreateFaultScenarioCommandHandler(IFaultScenarioRepository scenarios, ILiveNotifier live)
    : ICommandHandler<CreateFaultScenarioCommand, FaultScenarioDto>
{
    public async Task<Result<FaultScenarioDto>> Handle(CreateFaultScenarioCommand command, CancellationToken cancellationToken)
    {
        var name = command.Request.Name.Trim();
        var definition = ScenarioMapping.Serialize(command.Request with { Name = name });
        var id = await scenarios.AddAsync(name, definition, cancellationToken).ConfigureAwait(false);
        live.Publish(new ScenariosMessage());
        return Result.Success(ScenarioMapping.ToDto(new FaultScenarioRecord(id, name, definition), null));
    }
}
