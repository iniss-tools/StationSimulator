using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Archive;
using StationSimulator.Application.Audit;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Decorators;
using StationSimulator.Application.Designs;
using StationSimulator.Application.Devices;
using StationSimulator.Application.Devices.Sounds;
using StationSimulator.Application.Faces;
using StationSimulator.Application.Fonts;
using StationSimulator.Application.Recordings;
using StationSimulator.Application.Scenarios;
using StationSimulator.Application.Signage;
using StationSimulator.Application.Station;
using StationSimulator.Application.Virtual;
using StationSimulator.Core.Virtual;

namespace StationSimulator.Application;

/// <summary>Registracia aplikacnej vrstvy: handlery prikazov a dotazov, dekoratory, validatory a sluzby.</summary>
public static class DependencyInjection
{
    /// <summary>
    /// Handlery najde v tomto zostaveni (Scrutor). Dekoratory obalia kazdy handler - posledny pridany je vonkajsi:
    /// zaznam (cas, chyba) obsahuje audit a ten overenie vstupov - do auditu ide aj prikaz s neplatnymi vstupmi.
    /// </summary>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.Scan(scan => scan.FromAssembliesOf(typeof(DependencyInjection))
            .AddClasses(classes => classes.AssignableTo(typeof(IQueryHandler<,>)).Where(t => !t.IsGenericTypeDefinition), publicOnly: false)
            .AsImplementedInterfaces()
            .WithScopedLifetime()
            .AddClasses(classes => classes.AssignableTo(typeof(ICommandHandler<>)).Where(t => !t.IsGenericTypeDefinition), publicOnly: false)
            .AsImplementedInterfaces()
            .WithScopedLifetime()
            .AddClasses(classes => classes.AssignableTo(typeof(ICommandHandler<,>)).Where(t => !t.IsGenericTypeDefinition), publicOnly: false)
            .AsImplementedInterfaces()
            .WithScopedLifetime());

        services.Decorate(typeof(IQueryHandler<,>), typeof(ValidationQueryHandler<,>));
        services.Decorate(typeof(ICommandHandler<,>), typeof(ValidationCommandHandler<,>));
        services.Decorate(typeof(ICommandHandler<>), typeof(ValidationCommandHandler<>));

        services.Decorate(typeof(ICommandHandler<,>), typeof(AuditCommandHandler<,>));
        services.Decorate(typeof(ICommandHandler<>), typeof(AuditCommandHandler<>));

        services.Decorate(typeof(IQueryHandler<,>), typeof(LoggingQueryHandler<,>));
        services.Decorate(typeof(ICommandHandler<,>), typeof(LoggingCommandHandler<,>));
        services.Decorate(typeof(ICommandHandler<>), typeof(LoggingCommandHandler<>));

        // popisy chyb su anglicke a nezavisle od jazyka systemu - text pre obsluhu sklada webove rozhranie podla kodu chyby
        ValidatorOptions.Global.LanguageManager.Enabled = false;
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly, includeInternalTypes: true);

        services.AddSingleton<RoleCatalog>();
        services.AddSingleton<RecordingService>();
        services.AddSingleton<FontCatalog>();
        services.AddSingleton<DesignCatalog>();
        services.AddScoped<AuditWriter>();
        services.AddSingleton<ArchiveCatalog>();
        services.AddSingleton<ReportMonitor>();
        services.AddScoped<StationImporter>();
        services.AddScoped<FaceHeaders>();
        services.AddSingleton<SignagePanelTracker>();
        services.AddSingleton<ScenarioRunner>();
        services.AddSingleton<SoundBanks>();
        services.AddSingleton<DeviceClock>();
        services.AddSingleton<SignageMediaStore>();
        services.AddSingleton<XslTablePages>();
        services.AddSingleton<InissViewSite>();
        return services;
    }
}
