using FluentValidation;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Mapping;
using StationSimulator.Contracts.Boards;
using StationSimulator.Core.Simulation;

namespace StationSimulator.Application.Boards;

/// <summary>Co tabule ukazuju ako text, zoradene podla linky a adresy; linka null = vsetky.</summary>
public sealed record GetBoardTextsQuery(int? Line) : IQuery<IReadOnlyList<BoardTextDto>>;

public sealed class GetBoardTextsQueryValidator : AbstractValidator<GetBoardTextsQuery>
{
    public GetBoardTextsQueryValidator() => RuleFor(q => q.Line).InclusiveBetween(1, 100).When(q => q.Line is not null).WithErrorCode(BoardErrors.Line);
}

public sealed class GetBoardTextsQueryHandler(Simulator simulator) : IQueryHandler<GetBoardTextsQuery, IReadOnlyList<BoardTextDto>>
{
    public Task<Result<IReadOnlyList<BoardTextDto>>> Handle(GetBoardTextsQuery query, CancellationToken cancellationToken)
    {
        IReadOnlyList<BoardTextDto> texts = simulator.Read(s => s.Boards.Where(b => query.Line is null || b.Line == query.Line).Select(DtoMapper.ToTextDto).ToList());
        return Task.FromResult(Result.Success(texts));
    }
}
