using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Frames;

namespace StationSimulator.Application.Frames;

/// <summary>Zaznamy komunikacie s poradovym cislom vacsim nez <paramref name="After" />.</summary>
public sealed record GetLogQuery(long After) : IQuery<FrameDto[]>;
