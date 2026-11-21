using StationSimulator.Contracts.Signage;

namespace StationSimulator.Application.Signage;

/// <summary>Panel v zalohe.</summary>
public sealed record SignageBackupPanel(int Id, SetSignagePanelRequest Definition);
