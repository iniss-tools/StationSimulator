namespace StationSimulator.Application.Schemas;

/// <summary>Obrazok pozadia schemy na odoslanie.</summary>
public sealed record SchemaBackgroundFile(string ContentType, byte[] Data);
