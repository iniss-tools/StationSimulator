using System.Text.Json.Serialization;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Backup;

namespace StationSimulator.Application.Backup;

/// <summary>Pripravi obnovu zo zalohy na najblizsi start servera. Obsah do auditu nejde.</summary>
public sealed record RestoreBackupCommand([property: JsonIgnore] Stream Content) : ICommand<BackupInfoDto>, IAuditable
{
    string IAuditable.AuditTarget => "restore";
}

public sealed class RestoreBackupCommandHandler(IServerBackup backup) : ICommandHandler<RestoreBackupCommand, BackupInfoDto>
{
    public Task<Result<BackupInfoDto>> Handle(RestoreBackupCommand command, CancellationToken cancellationToken) =>
        backup.PrepareRestoreAsync(command.Content, cancellationToken);
}
