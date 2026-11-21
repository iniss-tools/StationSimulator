using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Live;
using StationSimulator.Application.Settings;
using StationSimulator.Contracts.Live;

namespace StationSimulator.Application.Designs;

public sealed class DeleteDesignCommandHandler(AppPaths paths, ISettingsStore settings, ILiveNotifier live) : ICommandHandler<DeleteDesignCommand>
{
    public Task<Result> Handle(DeleteDesignCommand command, CancellationToken cancellationToken)
    {
        var folder = paths.DesignsFolder(settings.Current);
        // id z adresy - len meno priecinka priamo v priecinku vzhladov
        var dir = Path.Combine(folder, command.Id);
        var file = Path.Combine(dir, "design.json");
        if (command.Id.Length == 0 || Path.GetFileName(command.Id) != command.Id || command.Id is "." or ".." || !File.Exists(file))
            return Task.FromResult(Result.Failure(DesignErrors.NotCustom(command.Id)));
        File.Delete(file);
        // ostatne subory vzhladu (napr. obrazky) ostanu
        if (!Directory.EnumerateFileSystemEntries(dir).Any())
            Directory.Delete(dir);
        live.Publish(new DesignMessage(command.Id));
        return Task.FromResult(Result.Success());
    }
}
