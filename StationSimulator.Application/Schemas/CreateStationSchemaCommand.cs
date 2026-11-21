using FluentValidation;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Audit;
using StationSimulator.Application.Live;
using StationSimulator.Contracts.Live;
using StationSimulator.Contracts.Schemas;

namespace StationSimulator.Application.Schemas;

/// <summary>Zalozi schemu stanice.</summary>
public sealed record CreateStationSchemaCommand(StationSchemaRequest Request) : ICommand<StationSchemaDto>, IAuditable
{
    string IAuditable.AuditTarget => Request.Name;
}

public sealed class CreateStationSchemaCommandValidator : AbstractValidator<CreateStationSchemaCommand>
{
    public CreateStationSchemaCommandValidator()
    {
        RuleFor(c => c.Request).NotNull().WithErrorCode(SchemaErrors.Name).SetValidator(new StationSchemaRequestValidator());
    }
}

public sealed class CreateStationSchemaCommandHandler(IStationSchemaRepository schemas, ILiveNotifier live)
    : ICommandHandler<CreateStationSchemaCommand, StationSchemaDto>
{
    public async Task<Result<StationSchemaDto>> Handle(CreateStationSchemaCommand command, CancellationToken cancellationToken)
    {
        var name = command.Request.Name.Trim();
        var definition = SchemaMapping.Serialize(command.Request with { Name = name });
        var id = await schemas.AddAsync(name, definition, cancellationToken).ConfigureAwait(false);
        live.Publish(new SchemasMessage());
        return Result.Success(SchemaMapping.ToDto(new StationSchemaRecord(id, name, definition), null));
    }
}
