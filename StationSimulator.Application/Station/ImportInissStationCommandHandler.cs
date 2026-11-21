using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Settings;
using StationSimulator.Contracts.Station;

namespace StationSimulator.Application.Station;

public sealed class ImportInissStationCommandHandler(ISettingsStore settings, StationImporter importer)
    : ICommandHandler<ImportInissStationCommand, StationImportedDto>
{
    public async Task<Result<StationImportedDto>> Handle(ImportInissStationCommand command, CancellationToken cancellationToken)
    {
        var station = InissStations.Read(settings.Current);
        if (station.IsFailure)
            return Result.Failure<StationImportedDto>(station.Error);
        return Result.Success(await importer.ImportAsync(InissStations.ToRequest(station.Value, command.Options), cancellationToken).ConfigureAwait(false));
    }
}
