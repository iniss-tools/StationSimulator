using System.Text.Json.Serialization;

namespace StationSimulator.Contracts.Signage;

/// <summary>Zarovnanie odseku.</summary>
[JsonConverter(typeof(JsonStringEnumConverter<SignageAlign>))]
public enum SignageAlign
{
    [JsonStringEnumMemberName("left")] Left,
    [JsonStringEnumMemberName("center")] Center,
    [JsonStringEnumMemberName("right")] Right
}
