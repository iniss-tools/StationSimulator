using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;

namespace StationSimulator.Application.Fonts;

public sealed class GetFontsQueryHandler(FontCatalog fonts) : IQueryHandler<GetFontsQuery, string[]>
{
    public Task<Result<string[]>> Handle(GetFontsQuery query, CancellationToken cancellationToken) => Task.FromResult(Result.Success(fonts.List()));
}
