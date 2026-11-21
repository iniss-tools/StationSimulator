using System.Text.Json;
using StationSimulator.Core.Boards;
using StationSimulator.Core.Simulation;

namespace StationSimulator.Persistence.Simulation;

/// <summary>Profil tabule v stlpci databazy - ten isty JSON ako v subore konfiguracie.</summary>
internal static class ProfileJson
{
    public static string Write(BoardProfile profile) => JsonSerializer.Serialize(profile, SimulatorConfigJson.Options);

    public static BoardProfile Read(string json) => JsonSerializer.Deserialize<BoardProfile>(json, SimulatorConfigJson.Options) ?? new BoardProfile();
}
