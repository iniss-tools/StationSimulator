using StationSimulator.Application.Alerts;
using StationSimulator.Application.Backup;
using StationSimulator.Application.Database;
using StationSimulator.Infrastructure.Alerts;
using StationSimulator.Application.Https;
using StationSimulator.Application.Live;
using StationSimulator.Application.Server;
using StationSimulator.Application.Settings;
using StationSimulator.Core.Simulation;
using StationSimulator.Core.Transport;
using StationSimulator.Core.Virtual;
using StationSimulator.Infrastructure.Backup;
using StationSimulator.Infrastructure.Hosting;
using StationSimulator.Infrastructure.Https;
using StationSimulator.Infrastructure.Persistence;
using StationSimulator.Infrastructure.Realtime;

namespace StationSimulator.Infrastructure;

/// <summary>Registracia infrastruktury servera: simulator, spojenia liniek, ulozenie liniek a tabul, WebSocket, HTTPS.</summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, AppPaths paths, ISettingsStore settings, ServerEndpoints endpoints)
    {
        services.AddSingleton(paths);
        services.AddSingleton(settings);
        services.AddSingleton(endpoints);
        services.AddSingleton<ISecretProtector, SecretProtector>();
        services.AddSingleton<HttpsCertificates>();
        services.AddSingleton<IHttpsCertificates>(sp => sp.GetRequiredService<HttpsCertificates>());
        services.AddSingleton(_ => new Simulator());
        services.AddSingleton<IServerHost, ServerHost>();
        services.AddSingleton<IServerUpdates, ServerUpdates>();
        services.AddSingleton<TransportManager>();
        services.AddSingleton<SimulatorConfigStore>();
        services.AddSingleton<IServerBackup, ServerBackup>();
        services.AddSingleton<IDatabaseSettings, DatabaseSettings>();
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<XmlTableFolders>();
        services.AddSingleton<LiveHub>();
        services.AddSingleton<ILiveNotifier>(sp => sp.GetRequiredService<LiveHub>());
        services.AddHostedService<SimulatorHostedService>();
        // za SimulatorHostedService - pri ukonceni servera zastavi scenare skor, nez sa linky a tabule ulozia
        services.AddHostedService<ScenarioHostedService>();
        services.AddHostedService<DeviceClockService>();
        services.AddHostedService<DeviceHistoryService>();
        services.AddHostedService<DesignWatcherService>();
        services.AddHostedService<XmlTableWatcherService>();
        services.AddHostedService<ReportMonitorService>();
        services.AddHostedService<AuditRetentionService>();
        services.AddHostedService<StatisticsService>();
        services.AddSingleton<IAlertChannel, WebhookAlertChannel>();
        services.AddSingleton<IAlertChannel, EmailAlertChannel>();
        services.AddHostedService<LineAlertService>();
        services.AddHostedService<UpdateCheckService>();
        return services;
    }
}
