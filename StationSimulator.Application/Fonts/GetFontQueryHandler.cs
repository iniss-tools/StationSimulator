using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Fonts;

namespace StationSimulator.Application.Fonts;

public sealed class GetFontQueryHandler(FontCatalog fonts) : IQueryHandler<GetFontQuery, FontFileDto>
{
    public Task<Result<FontFileDto>> Handle(GetFontQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(fonts.Get(query.File) is { } font ? Result.Success(font) : Result.Failure<FontFileDto>(FontErrors.NotFound(query.File)));
}
