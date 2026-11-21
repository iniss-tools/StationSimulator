using FluentValidation;

namespace StationSimulator.Application.Boards;

public sealed class SetBoardFaultCommandValidator : AbstractValidator<SetBoardFaultCommand>
{
    public SetBoardFaultCommandValidator() =>
        RuleFor(c => c.Fault).NotNull().WithErrorCode(BoardErrors.FaultKind).SetValidator(new BoardFaultValidator());
}
