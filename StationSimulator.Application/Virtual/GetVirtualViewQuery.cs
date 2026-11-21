using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Virtual;

namespace StationSimulator.Application.Virtual;

/// <summary>Co ukazuje virtualna tabula <paramref name="Id" />: vybrane zaznamy jej XML.</summary>
public sealed record GetVirtualViewQuery(int Id) : IQuery<VirtualViewDto>;
