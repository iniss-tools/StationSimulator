using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Faces;
using StationSimulator.Core.Simulation;

namespace StationSimulator.Application.Config;

public sealed class ExportConfigQueryHandler(Simulator simulator, IFaceRepository faces) : IQueryHandler<ExportConfigQuery, ConfigFile>
{
    public const string FileName = "stationsimulator-linky.json";

    public async Task<Result<ConfigFile>> Handle(ExportConfigQuery query, CancellationToken cancellationToken)
    {
        var config = simulator.ToConfig();
        // vlastne predlohy ciel idu so subormi - vstavane ma kazdy server
        var used = config.Boards.Select(b => b.Profile.Face).OfType<string>().ToHashSet(StringComparer.OrdinalIgnoreCase);
        var custom = (await faces.ListAsync(cancellationToken).ConfigureAwait(false))
            .Where(f => used.Contains(f.Id))
            .Select(BoardFaces.Deserialize)
            .ToList();
        return Result.Success(new ConfigFile(SimulatorConfigJson.Serialize(config with { Faces = custom }), FileName));
    }
}
