using FluentValidation;
using StationSimulator.Application.Auth;

namespace StationSimulator.Application.Keys;

public sealed class CreateAccessKeyCommandValidator : AbstractValidator<CreateAccessKeyCommand>
{
    public CreateAccessKeyCommandValidator(RoleCatalog roles)
    {
        RuleFor(c => c.Request).NotNull().WithErrorCode(KeyErrors.Name);
        When(c => c.Request is not null, () =>
        {
            RuleFor(c => c.Request.Name).Must(n => !string.IsNullOrWhiteSpace(n)).MaximumLength(100).WithErrorCode(KeyErrors.Name);
            RuleFor(c => c.Request.Kind).IsInEnum().WithErrorCode(KeyErrors.Kind);
            RuleFor(c => c.Request.Role).Must(r => roles.Find(r) is not null).WithErrorCode(KeyErrors.Role);
        });
    }
}
