using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Database;

namespace StationSimulator.Application.Database;

/// <summary>Pouzivana a vybrana databaza.</summary>
public sealed record GetDatabaseSettingsQuery : IQuery<DatabaseSettingsDto>;

public sealed class GetDatabaseSettingsQueryHandler(IDatabaseSettings database) : IQueryHandler<GetDatabaseSettingsQuery, DatabaseSettingsDto>
{
    public Task<Result<DatabaseSettingsDto>> Handle(GetDatabaseSettingsQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(Result.Success(database.Get()));
}
