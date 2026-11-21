using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;

namespace StationSimulator.Application.Users;

public sealed class DeleteUserCommandHandler(IUserService users) : ICommandHandler<DeleteUserCommand>
{
    public Task<Result> Handle(DeleteUserCommand command, CancellationToken cancellationToken) =>
        users.DeleteAsync(command.UserName, cancellationToken);
}
