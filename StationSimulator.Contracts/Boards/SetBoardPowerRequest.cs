namespace StationSimulator.Contracts.Boards;

/// <summary>Napajanie tabule (telo POST /api/boards/{id}/power).</summary>
/// <param name="On">true = zapnute, false = predstierany vypadok napajania</param>
public sealed record SetBoardPowerRequest(bool On);
