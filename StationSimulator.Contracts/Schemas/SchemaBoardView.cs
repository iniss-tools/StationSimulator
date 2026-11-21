using System.Text.Json.Serialization;

namespace StationSimulator.Contracts.Schemas;

/// <summary>Ako sa na scheme kresli tabula.</summary>
[JsonConverter(typeof(JsonStringEnumConverter<SchemaBoardView>))]
public enum SchemaBoardView
{
    /// <summary>Zmenseny zivy obsah tabule.</summary>
    [JsonStringEnumMemberName("live")] Live,

    /// <summary>Len znacka so stavom.</summary>
    [JsonStringEnumMemberName("symbol")] Symbol
}
