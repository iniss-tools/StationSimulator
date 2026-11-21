using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;

namespace StationSimulator.Application.Backup;

/// <summary>Zaloha celeho simulatora; <paramref name="Recordings" /> = aj zaznamy komunikacie.</summary>
public sealed record CreateBackupQuery(bool Recordings) : IQuery<BackupFile>;

public sealed class CreateBackupQueryHandler(IServerBackup backup) : IQueryHandler<CreateBackupQuery, BackupFile>
{
    public async Task<Result<BackupFile>> Handle(CreateBackupQuery query, CancellationToken cancellationToken) =>
        Result.Success(await backup.CreateAsync(query.Recordings, cancellationToken).ConfigureAwait(false));
}
