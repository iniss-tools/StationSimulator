using System.Text.Json.Serialization;

namespace StationSimulator.Contracts.Designs;

/// <summary>Tvar bodu tabule.</summary>
[JsonConverter(typeof(JsonStringEnumConverter<DesignShape>))]
public enum DesignShape
{
    [JsonStringEnumMemberName("circle")] Circle,
    [JsonStringEnumMemberName("square")] Square,
    [JsonStringEnumMemberName("rounded")] Rounded
}
