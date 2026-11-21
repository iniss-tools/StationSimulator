using System.Text.Json.Serialization;

namespace StationSimulator.Core.Boards.Faces;

/// <summary>Ako sa kreslia hodiny cela.</summary>
public enum FaceRender
{
    /// <summary>Pismom prehliadaca.</summary>
    [JsonStringEnumMemberName("text")] Text,

    /// <summary>Bodmi ako matica tabule (LED, LCD) - samostatny maly modul.</summary>
    [JsonStringEnumMemberName("display")] Display
}
