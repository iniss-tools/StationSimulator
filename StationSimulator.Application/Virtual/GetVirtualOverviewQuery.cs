using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Virtual;

namespace StationSimulator.Application.Virtual;

/// <summary>Virtualne tabule, najdene XML tabul a sledovane priecinky.</summary>
public sealed record GetVirtualOverviewQuery : IQuery<VirtualOverviewDto>;
