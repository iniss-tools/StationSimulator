using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Recordings;

namespace StationSimulator.Application.Recordings;

/// <summary>Zoznam zaznamov so stavom zaznamu a prehravania.</summary>
public sealed record GetRecordingsQuery : IQuery<RecordingsDto>;
