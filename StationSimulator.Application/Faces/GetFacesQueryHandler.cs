using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Mapping;
using StationSimulator.Contracts.Faces;

namespace StationSimulator.Application.Faces;

public sealed class GetFacesQueryHandler(IFaceRepository faces) : IQueryHandler<GetFacesQuery, BoardFaceDto[]>
{
    public async Task<Result<BoardFaceDto[]>> Handle(GetFacesQuery query, CancellationToken cancellationToken)
    {
        var custom = await faces.ListAsync(cancellationToken).ConfigureAwait(false);
        // vlastne predlohy podla nazvu za vstavanymi
        return Result.Success(BoardFaces.BuiltIn.Select(f => DtoMapper.ToDto(f, true))
            .Concat(custom.Select(BoardFaces.Deserialize).OrderBy(f => f.Name, StringComparer.CurrentCulture).Select(f => DtoMapper.ToDto(f, false)))
            .ToArray());
    }
}
