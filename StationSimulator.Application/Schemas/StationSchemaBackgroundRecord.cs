namespace StationSimulator.Application.Schemas;

/// <summary>Obrazok pozadia schemy stanice v databaze - mimo definicie, aby sa neposielal so zoznamom schem.</summary>
/// <param name="SchemaId">cislo schemy</param>
/// <param name="ContentType">typ obsahu obrazka</param>
/// <param name="Data">obsah suboru</param>
/// <param name="Version">verzia - meni sa s kazdym nahratim</param>
public sealed record StationSchemaBackgroundRecord(int SchemaId, string ContentType, byte[] Data, string Version);
