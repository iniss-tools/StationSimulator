using StationSimulator.Application.Abstractions.Messaging;

namespace StationSimulator.Application.Fonts;

/// <summary>Mena suborov pisiem ELEN.</summary>
public sealed record GetFontsQuery : IQuery<string[]>;
