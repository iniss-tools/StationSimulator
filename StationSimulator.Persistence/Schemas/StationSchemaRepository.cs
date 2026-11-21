using Microsoft.EntityFrameworkCore;
using StationSimulator.Application.Schemas;

namespace StationSimulator.Persistence.Schemas;

/// <summary>Schemy stanice v databaze.</summary>
public sealed class StationSchemaRepository(AppDbContext db) : IStationSchemaRepository
{
    public async Task<IReadOnlyList<StationSchemaRecord>> ListAsync(CancellationToken cancellationToken) =>
        await db.StationSchemas.AsNoTracking().OrderBy(s => s.Id).ToListAsync(cancellationToken).ConfigureAwait(false);

    public async Task<int> AddAsync(string name, string definition, CancellationToken cancellationToken)
    {
        var record = new StationSchemaRecord(0, name, definition);
        db.StationSchemas.Add(record);
        await db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        var id = record.Id;
        db.ChangeTracker.Clear();
        return id;
    }

    public async Task<bool> UpdateAsync(StationSchemaRecord schema, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(schema);
        return await db.StationSchemas.Where(s => s.Id == schema.Id)
            .ExecuteUpdateAsync(u => u.SetProperty(s => s.Name, schema.Name).SetProperty(s => s.Definition, schema.Definition), cancellationToken)
            .ConfigureAwait(false) > 0;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        // obrazok najprv - mazanie bez nacitania sa nespolieha na kaskadu databazy
        await db.StationSchemaBackgrounds.Where(b => b.SchemaId == id).ExecuteDeleteAsync(cancellationToken).ConfigureAwait(false);
        return await db.StationSchemas.Where(s => s.Id == id).ExecuteDeleteAsync(cancellationToken).ConfigureAwait(false) > 0;
    }

    public async Task<IReadOnlyDictionary<int, string>> ListBackgroundsAsync(CancellationToken cancellationToken) =>
        await db.StationSchemaBackgrounds.AsNoTracking().Select(b => new { b.SchemaId, b.Version })
            .ToDictionaryAsync(b => b.SchemaId, b => b.Version, cancellationToken).ConfigureAwait(false);

    public Task<StationSchemaBackgroundRecord?> FindBackgroundAsync(int schemaId, CancellationToken cancellationToken) =>
        db.StationSchemaBackgrounds.AsNoTracking().FirstOrDefaultAsync(b => b.SchemaId == schemaId, cancellationToken);

    public async Task<bool> SetBackgroundAsync(StationSchemaBackgroundRecord background, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(background);
        if (!await db.StationSchemas.AnyAsync(s => s.Id == background.SchemaId, cancellationToken).ConfigureAwait(false))
            return false;
        await db.StationSchemaBackgrounds.Where(b => b.SchemaId == background.SchemaId).ExecuteDeleteAsync(cancellationToken).ConfigureAwait(false);
        db.StationSchemaBackgrounds.Add(background);
        await db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        db.ChangeTracker.Clear();
        return true;
    }

    public async Task<bool> DeleteBackgroundAsync(int schemaId, CancellationToken cancellationToken) =>
        await db.StationSchemaBackgrounds.Where(b => b.SchemaId == schemaId).ExecuteDeleteAsync(cancellationToken).ConfigureAwait(false) > 0;
}
