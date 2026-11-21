using StationSimulator.Application.Abstractions.Messaging;

namespace StationSimulator.Application.Recordings;

/// <summary>Subor zaznamu na stiahnutie.</summary>
public sealed record GetRecordingFileQuery(string Name) : IQuery<RecordingFile>;
