using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Keys;

namespace StationSimulator.Application.Keys;

/// <summary>Pristupove kluce bez tajnych hodnot.</summary>
public sealed record GetAccessKeysQuery : IQuery<IReadOnlyList<AccessKeyDto>>;
