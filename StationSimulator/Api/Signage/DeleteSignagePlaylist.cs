using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Signage;

namespace StationSimulator.Api.Signage;

/// <summary>DELETE /api/signage/playlists/{id} - odstrani playlist, ak sa nikde nepouziva.</summary>
public sealed class DeleteSignagePlaylist : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapDelete("signage/playlists/{id:int}", async (int id, ICommandHandler<DeleteSignageCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new DeleteSignageCommand(SignageEntity.Playlist, id), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.SignageManage);
}
