using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Faces;

namespace StationSimulator.Application.Faces;

/// <summary>Predlohy ciel tabul - vstavane a vlastne.</summary>
public sealed record GetFacesQuery : IQuery<BoardFaceDto[]>;
