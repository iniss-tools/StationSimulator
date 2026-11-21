using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Live;
using StationSimulator.Application.Mapping;
using StationSimulator.Contracts.Live;

namespace StationSimulator.Application.Faces;

public sealed class SetFaceCommandHandler(IFaceRepository faces, ILiveNotifier live) : ICommandHandler<SetFaceCommand>
{
    public async Task<Result> Handle(SetFaceCommand command, CancellationToken cancellationToken)
    {
        if (BoardFaces.FindBuiltIn(command.Id) is not null)
            return Result.Failure(FaceErrors.BuiltIn(command.Id));

        var face = RequestMapper.ToFace(command.Face, command.Id);
        await faces.SaveAsync(new FaceRecord(face.Id, face.Name, BoardFaces.Serialize(face)), cancellationToken).ConfigureAwait(false);
        live.Publish(new FacesMessage());
        return Result.Success();
    }
}
