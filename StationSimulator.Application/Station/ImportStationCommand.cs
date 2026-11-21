using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Station;

namespace StationSimulator.Application.Station;

/// <summary>Zalozi linky a tabule stanice INISSu (GVDEditor pri presmerovani liniek na simulator).</summary>
public sealed record ImportStationCommand(StationImportRequest Request) : ICommand<StationImportedDto>;
