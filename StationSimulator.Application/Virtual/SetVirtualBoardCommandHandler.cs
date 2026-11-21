using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Live;
using StationSimulator.Application.Mapping;
using StationSimulator.Contracts.Live;

namespace StationSimulator.Application.Virtual;

public sealed class SetVirtualBoardCommandHandler(IVirtualBoardRepository boards, IVirtualLayoutRepository layouts, ILiveNotifier live)
    : ICommandHandler<SetVirtualBoardCommand>
{
    public async Task<Result> Handle(SetVirtualBoardCommand command, CancellationToken cancellationToken)
    {
        var layout = (command.Request.Layout ?? "").Trim();
        if (layout.Length > 0 && VirtualLayouts.FindBuiltIn(layout) is null
                              && await layouts.FindAsync(layout, cancellationToken).ConfigureAwait(false) is null)
            return Result.Failure(VirtualErrors.LayoutNotFound(layout));

        await boards.SaveAsync(RequestMapper.ToVirtualBoard(command.Id, command.Request), cancellationToken).ConfigureAwait(false);
        live.Publish(new VirtualMessage([], true));
        return Result.Success();
    }
}
