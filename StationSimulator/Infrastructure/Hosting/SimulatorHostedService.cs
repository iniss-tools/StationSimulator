using StationSimulator.Application.Live;
using StationSimulator.Contracts.Live;
using StationSimulator.Core.Transport;
using StationSimulator.Infrastructure.Persistence;

namespace StationSimulator.Infrastructure.Hosting;

/// <summary>
/// Pri starte nacita linky a tabule z databazy a spusti ich spojenia s INISSom, pri ukonceni ich ulozi.
/// </summary>
public sealed class SimulatorHostedService(SimulatorConfigStore store, TransportManager transport, ILiveNotifier live) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await store.LoadAsync(cancellationToken).ConfigureAwait(false);
        await transport.SyncAsync().ConfigureAwait(false);
        // prehliadace otvorene pred restartom servera si nacitaju stav znova
        live.Publish(new StructureMessage());
    }

    public Task StopAsync(CancellationToken cancellationToken) => store.SaveAsync();
}
