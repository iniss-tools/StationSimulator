using System.Globalization;
using System.Text.Json.Serialization;
using FluentValidation;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Audit;
using StationSimulator.Application.Live;
using StationSimulator.Contracts.Live;
using StationSimulator.Contracts.Schemas;

namespace StationSimulator.Application.Schemas;

/// <summary>Nahra obrazok pozadia schemy stanice (obsah do auditu nejde); predosly nahradi.</summary>
public sealed record SetSchemaBackgroundCommand(int Id, string Name, [property: JsonIgnore] Stream Content) : ICommand<SchemaBackgroundDto>, IAuditable
{
    string IAuditable.AuditTarget => Id.ToString(CultureInfo.InvariantCulture);
}

public sealed class SetSchemaBackgroundCommandValidator : AbstractValidator<SetSchemaBackgroundCommand>
{
    public SetSchemaBackgroundCommandValidator()
    {
        RuleFor(c => c.Name).Must(n => SchemaBackgrounds.Types.ContainsKey(Path.GetExtension(n ?? ""))).WithErrorCode(SchemaErrors.BackgroundType)
            .WithMessage("Supported files: PNG, JPEG, GIF, WebP.");
    }
}

public sealed class SetSchemaBackgroundCommandHandler(IStationSchemaRepository schemas, ILiveNotifier live)
    : ICommandHandler<SetSchemaBackgroundCommand, SchemaBackgroundDto>
{
    public async Task<Result<SchemaBackgroundDto>> Handle(SetSchemaBackgroundCommand command, CancellationToken cancellationToken)
    {
        if (await SchemaBackgrounds.ReadAsync(command.Content, cancellationToken).ConfigureAwait(false) is not { } data)
            return Result.Failure<SchemaBackgroundDto>(SchemaErrors.BackgroundTooLarge());
        if (data.Length == 0)
            return Result.Failure<SchemaBackgroundDto>(SchemaErrors.BackgroundEmpty());

        var type = SchemaBackgrounds.Types[Path.GetExtension(command.Name)];
        var background = new StationSchemaBackgroundRecord(command.Id, type, data, Guid.NewGuid().ToString("N"));
        if (!await schemas.SetBackgroundAsync(background, cancellationToken).ConfigureAwait(false))
            return Result.Failure<SchemaBackgroundDto>(SchemaErrors.NotFound(command.Id));
        live.Publish(new SchemasMessage());
        return Result.Success(new SchemaBackgroundDto(background.Version));
    }
}
