using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Monitor;

namespace StationSimulator.Application.Monitor;

/// <summary>Instalacia ELEN Monitora: predlohy tabul, projekty a vzhlad.</summary>
public sealed record GetMonitorQuery : IQuery<MonitorDto>;
