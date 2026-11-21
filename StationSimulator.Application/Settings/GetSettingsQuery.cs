using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Settings;

namespace StationSimulator.Application.Settings;

/// <summary>Nastavenie servera.</summary>
public sealed record GetSettingsQuery : IQuery<SettingsDto>;
