using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;

namespace StationSimulator.Application.Auth;

public sealed class LogoutCommandHandler(IAuthService auth) : ICommandHandler<LogoutCommand>
{
    public async Task<Result> Handle(LogoutCommand command, CancellationToken cancellationToken)
    {
        await auth.SignOutAsync().ConfigureAwait(false);
        return Result.Success();
    }
}
