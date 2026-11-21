using System.Text.Json.Serialization;

namespace StationSimulator.Contracts.Virtual;

/// <summary>Zarovnanie textu stlpca.</summary>
[JsonConverter(typeof(JsonStringEnumConverter<VirtualAlign>))]
public enum VirtualAlign
{
    /// <summary>Vlavo.</summary>
    [JsonStringEnumMemberName("left")] Left,

    /// <summary>Na stred.</summary>
    [JsonStringEnumMemberName("center")] Center,

    /// <summary>Vpravo.</summary>
    [JsonStringEnumMemberName("right")] Right
}
