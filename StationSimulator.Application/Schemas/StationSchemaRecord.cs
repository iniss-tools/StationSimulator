using StationSimulator.Contracts.Schemas;

namespace StationSimulator.Application.Schemas;

/// <summary>Schema stanice v databaze; obsah (<see cref="StationSchemaRequest" />) ako JSON.</summary>
public sealed record StationSchemaRecord(int Id, string Name, string Definition);
