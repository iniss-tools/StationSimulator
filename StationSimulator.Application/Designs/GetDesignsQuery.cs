using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Designs;

namespace StationSimulator.Application.Designs;

/// <summary>Vzhlady tabul.</summary>
public sealed record GetDesignsQuery : IQuery<DesignInfoDto[]>;
