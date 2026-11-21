using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Server;

namespace StationSimulator.Application.Server;

/// <summary>Ako server bezi (sluzba Windows, verzia, priecinok nastaveni).</summary>
public sealed record GetServerInfoQuery : IQuery<ServerInfoDto>;
