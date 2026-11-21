using System.Globalization;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Audit;
using StationSimulator.Application.Live;
using StationSimulator.Contracts.Live;

namespace StationSimulator.Application.Schemas;

/// <summary>Odstrani obrazok pozadia schemy stanice.</summary>
public sealed record DeleteSchemaBackgroundCommand(int Id) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id.ToString(CultureInfo.InvariantCulture);
}

public sealed class DeleteSchemaBackgroundCommandHandler(IStationSchemaRepository schemas, ILiveNotifier live)
    : ICommandHandler<DeleteSchemaBackgroundCommand>
{
    public async Task<Result> Handle(DeleteSchemaBackgroundCommand command, CancellationToken cancellationToken)
    {
        if (!await schemas.DeleteBackgroundAsync(command.Id, cancellationToken).ConfigureAwait(false))
            return Result.Failure(SchemaErrors.BackgroundNotFound(command.Id));
        live.Publish(new SchemasMessage());
        return Result.Success();
    }
}
