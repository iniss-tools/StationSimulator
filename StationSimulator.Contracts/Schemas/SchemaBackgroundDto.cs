namespace StationSimulator.Contracts.Schemas;

/// <summary>Nahraty obrazok pozadia schemy.</summary>
/// <param name="Version">verzia obrazka - meni sa s kazdym nahratim (do adresy obrazka kvoli vyrovnavacej pamati)</param>
public sealed record SchemaBackgroundDto(string Version);
