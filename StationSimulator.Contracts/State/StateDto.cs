using StationSimulator.Contracts.Boards;
using StationSimulator.Contracts.Lines;
using StationSimulator.Contracts.Settings;

namespace StationSimulator.Contracts.State;

/// <summary>Cely stav pre prve nacitanie stranky.</summary>
/// <param name="SupportedClasses">triedy liniek, ktore simulator pozna</param>
/// <param name="Manufacturers">vyrobcovia tabul podla triedy linky (kluc = TableClass); prvy je predvoleny</param>
public sealed record StateDto(
    LineDto[] Lines,
    BoardDto[] Boards,
    int[] SupportedClasses,
    IReadOnlyDictionary<string, string[]> Manufacturers,
    SettingsDto Settings);
