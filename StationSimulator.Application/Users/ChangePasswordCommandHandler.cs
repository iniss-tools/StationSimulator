using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;

namespace StationSimulator.Application.Users;

public sealed class ChangePasswordCommandHandler(IUserService users) : ICommandHandler<ChangePasswordCommand>
{
    public Task<Result> Handle(ChangePasswordCommand command, CancellationToken cancellationToken) =>
        users.ChangeOwnPasswordAsync(command.Request.CurrentPassword, command.Request.NewPassword, cancellationToken);
}
