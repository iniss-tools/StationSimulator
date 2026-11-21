using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Settings;

namespace StationSimulator.Application.Settings;

/// <summary>Ulozi nastavenie servera.</summary>
public sealed record UpdateSettingsCommand(UpdateSettingsRequest Request) : ICommand<SettingsUpdatedDto>;
