namespace StationSimulator.Contracts.Lines;

/// <summary>Predstierany vypadok linky (telo POST /api/lines/{number}/outage).</summary>
/// <param name="Outage">true = vypadok, false = linka bezi</param>
public sealed record SetLineOutageRequest(bool Outage);
