using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Monitor;

namespace StationSimulator.Application.Monitor;

/// <summary>Kazdy simulator projektu ELEN Monitora sa stane tabulou na linke <paramref name="Line" />.</summary>
public sealed record ImportMonitorProjectCommand(string Project, int Line) : ICommand<MonitorImportedDto>, IAuditable
{
    string IAuditable.AuditTarget => Project;
}
