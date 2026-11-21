using FluentValidation;
using StationSimulator.Application.Auth;

namespace StationSimulator.Application.Users;

public sealed class SetUserPasswordCommandValidator : AbstractValidator<SetUserPasswordCommand>
{
    public SetUserPasswordCommandValidator()
    {
        RuleFor(c => c.Request).NotNull().WithErrorCode(AuthErrors.Password);
        RuleFor(c => c.Request.Password).NotNull().MinimumLength(UserNameRules.MinPasswordLength).WithErrorCode(AuthErrors.Password)
            .When(c => c.Request is not null);
    }
}
