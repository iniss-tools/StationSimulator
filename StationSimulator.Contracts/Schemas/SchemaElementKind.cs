using System.Text.Json.Serialization;

namespace StationSimulator.Contracts.Schemas;

/// <summary>Druh prvku schemy stanice: kresba stanice alebo zariadenie simulatora.</summary>
[JsonConverter(typeof(JsonStringEnumConverter<SchemaElementKind>))]
public enum SchemaElementKind
{
    /// <summary>Kolaj - lomena ciara s cislom kolaje v texte.</summary>
    [JsonStringEnumMemberName("track")] Track,

    /// <summary>Nastupiste.</summary>
    [JsonStringEnumMemberName("platform")] Platform,

    /// <summary>Budova.</summary>
    [JsonStringEnumMemberName("building")] Building,

    /// <summary>Vseobecna plocha.</summary>
    [JsonStringEnumMemberName("area")] Area,

    /// <summary>Vseobecna lomena ciara.</summary>
    [JsonStringEnumMemberName("path")] Path,

    /// <summary>Text.</summary>
    [JsonStringEnumMemberName("text")] Text,

    /// <summary>Tabula simulatora.</summary>
    [JsonStringEnumMemberName("board")] Board,

    /// <summary>Okruh rozhlasu ustredne alebo vzdialeneho INISSu.</summary>
    [JsonStringEnumMemberName("audio")] Audio,

    /// <summary>Okruh osvetlenia ustredne.</summary>
    [JsonStringEnumMemberName("light")] Light,

    /// <summary>Zosilnovac.</summary>
    [JsonStringEnumMemberName("amplifier")] Amplifier,

    /// <summary>Stav linky simulatora.</summary>
    [JsonStringEnumMemberName("commLine")] CommLine
}
