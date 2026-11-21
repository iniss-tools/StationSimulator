using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.OAuth;

namespace StationSimulator.Application.OAuth;

/// <summary>Prepojene aplikacie - vlastne povolenia; spravca klucov vidi vsetky.</summary>
public sealed record GetOAuthGrantsQuery : IQuery<IReadOnlyList<OAuthGrantDto>>;
