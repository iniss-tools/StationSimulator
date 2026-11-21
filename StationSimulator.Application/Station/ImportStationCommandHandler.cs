using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Station;

namespace StationSimulator.Application.Station;

public sealed class ImportStationCommandHandler(StationImporter importer) : ICommandHandler<ImportStationCommand, StationImportedDto>
{
    public async Task<Result<StationImportedDto>> Handle(ImportStationCommand command, CancellationToken cancellationToken) =>
        Result.Success(await importer.ImportAsync(command.Request, cancellationToken).ConfigureAwait(false));
}
