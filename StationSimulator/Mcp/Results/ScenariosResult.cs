using StationSimulator.Contracts.Scenarios;

namespace StationSimulator.Mcp.Results;

/// <summary>Scenare poruch.</summary>
public sealed record ScenariosResult(IReadOnlyList<FaultScenarioDto> Scenarios);
