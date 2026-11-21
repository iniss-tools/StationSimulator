namespace StationSimulator.Contracts.Schemas;

/// <summary>Bod lomenej ciary na platne schemy.</summary>
/// <param name="X">vodorovna poloha od laveho okraja platna</param>
/// <param name="Y">zvisla poloha od horneho okraja platna</param>
public sealed record SchemaPointDto(double X, double Y);
