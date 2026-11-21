namespace StationSimulator.Application.Schemas;

/// <summary>Schemy stanice v databaze.</summary>
public interface IStationSchemaRepository
{
    Task<IReadOnlyList<StationSchemaRecord>> ListAsync(CancellationToken cancellationToken);

    /// <summary>Prida schemu; vrati jej cislo.</summary>
    Task<int> AddAsync(string name, string definition, CancellationToken cancellationToken);

    /// <summary>Zmeni schemu; false = taka nie je.</summary>
    Task<bool> UpdateAsync(StationSchemaRecord schema, CancellationToken cancellationToken);

    /// <summary>Odstrani schemu aj s obrazkom pozadia; false = taka nie je.</summary>
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);

    /// <summary>Verzie obrazkov pozadia podla cisla schemy (bez obsahu).</summary>
    Task<IReadOnlyDictionary<int, string>> ListBackgroundsAsync(CancellationToken cancellationToken);

    /// <summary>Obrazok pozadia schemy; null = schema ho nema.</summary>
    Task<StationSchemaBackgroundRecord?> FindBackgroundAsync(int schemaId, CancellationToken cancellationToken);

    /// <summary>Nahradi obrazok pozadia schemy; false = schema nie je.</summary>
    Task<bool> SetBackgroundAsync(StationSchemaBackgroundRecord background, CancellationToken cancellationToken);

    /// <summary>Odstrani obrazok pozadia; false = schema ho nema.</summary>
    Task<bool> DeleteBackgroundAsync(int schemaId, CancellationToken cancellationToken);
}
