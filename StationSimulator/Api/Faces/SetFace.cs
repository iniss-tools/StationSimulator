using JetBrains.Annotations;
using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Faces;
using StationSimulator.Contracts.Faces;

namespace StationSimulator.Api.Faces;

/// <summary>PUT /api/faces/{id} - zalozi alebo zmeni vlastnu predlohu cela tabule.</summary>
[UsedImplicitly]
public sealed class SetFace : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPut("faces/{id}", async (string id, BoardFaceDto face, ICommandHandler<SetFaceCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new SetFaceCommand(id, face), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.DesignsManage);
}
