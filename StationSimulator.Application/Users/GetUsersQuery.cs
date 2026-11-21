using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Contracts.Users;

namespace StationSimulator.Application.Users;

/// <summary>Vsetci pouzivatelia podla mena.</summary>
public sealed record GetUsersQuery : IQuery<IReadOnlyList<UserDto>>;
