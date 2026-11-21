using System.Xml;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Live;
using StationSimulator.Application.Mapping;
using StationSimulator.Contracts.Live;
using StationSimulator.Contracts.Virtual;
using StationSimulator.Core.Virtual;

namespace StationSimulator.Application.Virtual;

public sealed class ImportInissViewCommandHandler(IVirtualBoardRepository boards, ILiveNotifier live)
    : ICommandHandler<ImportInissViewCommand, InissViewImportedDto>
{
    public async Task<Result<InissViewImportedDto>> Handle(ImportInissViewCommand command, CancellationToken cancellationToken)
    {
        InissViewConfig config;
        try
        {
            config = InissViewConfig.Parse(command.Content);
        }
        catch (XmlException e)
        {
            return Result.Failure<InissViewImportedDto>(VirtualErrors.InvalidConfig(e.Message));
        }

        // cisla mimo rozsahu simulatora sa vynechaju rovnako ako duplicity
        var tables = config.Tables.Where(t => t.Number is >= 1 and <= VirtualErrors.MaxId).ToArray();
        if (tables.Length == 0)
            return Result.Failure<InissViewImportedDto>(VirtualErrors.NoTables());

        var counts = await boards.ImportAsync(tables.Select(RequestMapper.ToVirtualBoard).ToArray(), command.Replace, cancellationToken)
            .ConfigureAwait(false);
        live.Publish(new VirtualMessage([], true));
        return Result.Success(new InissViewImportedDto(counts.Added, counts.Replaced, counts.Skipped + config.Tables.Count - tables.Length,
            config.Duplicates, config.XmlFolders));
    }
}
