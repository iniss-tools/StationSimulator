using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.OAuth;

namespace StationSimulator.Application.OAuth;

/// <summary>Ziadost klienta MCP pre stranku povolenia a roly, ktore moze prihlaseny pouzivatel dat.</summary>
public sealed record GetOAuthRequestQuery(string Id) : IQuery<OAuthRequestDto>;
