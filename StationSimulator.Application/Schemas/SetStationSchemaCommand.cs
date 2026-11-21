using System.Globalization;
using FluentValidation;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Audit;
using StationSimulator.Application.Live;
using StationSimulator.Contracts.Live;
using StationSimulator.Contracts.Schemas;

namespace StationSimulator.Application.Schemas;

/// <summary>Zmeni schemu stanice.</summary>
public sealed record SetStationSchemaCommand(int Id, StationSchemaRequest Request) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id.ToString(CultureInfo.InvariantCulture);
}

public sealed class SetStationSchemaCommandValidator : AbstractValidator<SetStationSchemaCommand>
{
    public SetStationSchemaCommandValidator()
    {
        RuleFor(c => c.Request).NotNull().WithErrorCode(SchemaErrors.Name).SetValidator(new StationSchemaRequestValidator());
    }
}

public sealed class SetStationSchemaCommandHandler(IStationSchemaRepository schemas, ILiveNotifier live) : ICommandHandler<SetStationSchemaCommand>
{
    public async Task<Result> Handle(SetStationSchemaCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request with { Name = command.Request.Name.Trim() };
        if (!await schemas.UpdateAsync(new StationSchemaRecord(command.Id, request.Name, SchemaMapping.Serialize(request)), cancellationToken)
                .ConfigureAwait(false))
            return Result.Failure(SchemaErrors.NotFound(command.Id));
        live.Publish(new SchemasMessage());
        return Result.Success();
    }
}
