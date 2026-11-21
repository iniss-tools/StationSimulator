using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Signage;
using StationSimulator.Contracts.Signage;

namespace StationSimulator.Api.Signage;

/// <summary>PUT /api/signage/messages/{id} - zmeni spravu.</summary>
public sealed class UpdateSignageMessage : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPut("signage/messages/{id:int}", async (int id, SetSignageMessageRequest request, ICommandHandler<SaveSignageMessageCommand, SignageCreatedDto> handler,
            CancellationToken cancellationToken) =>
            (await handler.Handle(new SaveSignageMessageCommand(id, request), cancellationToken)).Match(_ => Results.NoContent(), CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.SignageManage);
}
