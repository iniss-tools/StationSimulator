using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Fonts;

namespace StationSimulator.Application.Fonts;

/// <summary>Subor pisiem ELEN pre prehliadac.</summary>
/// <param name="File">meno suboru .bin</param>
public sealed record GetFontQuery(string File) : IQuery<FontFileDto>;
