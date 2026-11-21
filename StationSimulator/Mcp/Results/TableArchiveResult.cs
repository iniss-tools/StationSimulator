using System.ComponentModel;
using StationSimulator.Contracts.Archive;

namespace StationSimulator.Mcp.Results;

/// <summary>Stranka denneho archivu tabul INISSu.</summary>
public sealed record TableArchiveResult(
    [property: Description("Day of the archive; null = no archive found.")]
    DateOnly? Date,
    [property: Description("Days with an archive, newest first (at most 31).")]
    IReadOnlyList<DateOnly> AvailableDays,
    [property: Description("Number of entries matching the filter.")]
    int Total,
    [property: Description("Lines of the archive file that could not be read.")]
    int Skipped,
    IReadOnlyList<TableArchiveEntryDto> Entries);
