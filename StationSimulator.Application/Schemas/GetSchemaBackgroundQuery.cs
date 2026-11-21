using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;

namespace StationSimulator.Application.Schemas;

/// <summary>Obrazok pozadia schemy stanice.</summary>
public sealed record GetSchemaBackgroundQuery(int Id) : IQuery<SchemaBackgroundFile>;

public sealed class GetSchemaBackgroundQueryHandler(IStationSchemaRepository schemas) : IQueryHandler<GetSchemaBackgroundQuery, SchemaBackgroundFile>
{
    public async Task<Result<SchemaBackgroundFile>> Handle(GetSchemaBackgroundQuery query, CancellationToken cancellationToken) =>
        await schemas.FindBackgroundAsync(query.Id, cancellationToken).ConfigureAwait(false) is { } background
            ? Result.Success(new SchemaBackgroundFile(background.ContentType, background.Data))
            : Result.Failure<SchemaBackgroundFile>(SchemaErrors.BackgroundNotFound(query.Id));
}
