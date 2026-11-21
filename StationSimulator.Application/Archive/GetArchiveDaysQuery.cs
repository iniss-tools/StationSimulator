using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Archive;

namespace StationSimulator.Application.Archive;

/// <summary>Dni dennych archivov v priecinkoch logov INISSu.</summary>
public sealed record GetArchiveDaysQuery : IQuery<ArchiveDaysDto>;
