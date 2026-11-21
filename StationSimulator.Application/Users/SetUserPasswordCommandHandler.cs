using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;

namespace StationSimulator.Application.Users;

public sealed class SetUserPasswordCommandHandler(IUserService users) : ICommandHandler<SetUserPasswordCommand>
{
    public Task<Result> Handle(SetUserPasswordCommand command, CancellationToken cancellationToken) =>
        users.SetPasswordAsync(command.UserName, command.Request.Password, cancellationToken);
}
