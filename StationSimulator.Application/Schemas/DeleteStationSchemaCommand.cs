using System.Globalization;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Audit;
using StationSimulator.Application.Live;
using StationSimulator.Contracts.Live;

namespace StationSimulator.Application.Schemas;

/// <summary>Odstrani schemu stanice.</summary>
public sealed record DeleteStationSchemaCommand(int Id) : ICommand, IAuditable
{
    string IAuditable.AuditTarget => Id.ToString(CultureInfo.InvariantCulture);
}

public sealed class DeleteStationSchemaCommandHandler(IStationSchemaRepository schemas, ILiveNotifier live) : ICommandHandler<DeleteStationSchemaCommand>
{
    public async Task<Result> Handle(DeleteStationSchemaCommand command, CancellationToken cancellationToken)
    {
        if (!await schemas.DeleteAsync(command.Id, cancellationToken).ConfigureAwait(false))
            return Result.Failure(SchemaErrors.NotFound(command.Id));
        live.Publish(new SchemasMessage());
        return Result.Success();
    }
}
