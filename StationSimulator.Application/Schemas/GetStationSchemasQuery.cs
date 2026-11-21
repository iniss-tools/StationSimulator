using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Schemas;

namespace StationSimulator.Application.Schemas;

/// <summary>Schemy stanice.</summary>
public sealed record GetStationSchemasQuery : IQuery<IReadOnlyList<StationSchemaDto>>;

public sealed class GetStationSchemasQueryHandler(IStationSchemaRepository schemas) : IQueryHandler<GetStationSchemasQuery, IReadOnlyList<StationSchemaDto>>
{
    public async Task<Result<IReadOnlyList<StationSchemaDto>>> Handle(GetStationSchemasQuery query, CancellationToken cancellationToken)
    {
        var records = await schemas.ListAsync(cancellationToken).ConfigureAwait(false);
        var backgrounds = await schemas.ListBackgroundsAsync(cancellationToken).ConfigureAwait(false);
        return Result.Success<IReadOnlyList<StationSchemaDto>>(records.Select(r => SchemaMapping.ToDto(r, backgrounds.GetValueOrDefault(r.Id))).ToList());
    }
}
