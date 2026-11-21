using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Station;

namespace StationSimulator.Application.Station;

/// <summary>Nacita instalaciu INISSu z nastavenia a zalozi jej linky a tabule (ako import stanice z GVDEditora).</summary>
/// <param name="Options">jazyk popisov na celach a ci celo dostanu aj tabule bez cela; null = predvolene</param>
public sealed record ImportInissStationCommand(InissStationImportRequest? Options = null) : ICommand<StationImportedDto>;
