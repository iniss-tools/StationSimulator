using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;

namespace StationSimulator.Application.Users;

public sealed class UnlockUserCommandHandler(IUserService users) : ICommandHandler<UnlockUserCommand>
{
    public Task<Result> Handle(UnlockUserCommand command, CancellationToken cancellationToken) =>
        users.UnlockAsync(command.UserName, cancellationToken);
}
