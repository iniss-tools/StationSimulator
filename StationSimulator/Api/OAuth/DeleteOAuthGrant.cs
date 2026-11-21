using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.OAuth;

namespace StationSimulator.Api.OAuth;

/// <summary>DELETE /api/oauth/grants/{id} - zrusi pristup prepojenej aplikacie.</summary>
public sealed class DeleteOAuthGrant : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapDelete("oauth/grants/{id:guid}", async (Guid id, ICommandHandler<DeleteOAuthGrantCommand> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new DeleteOAuthGrantCommand(id), cancellationToken)).Match(Results.NoContent, CustomResults.Problem))
            .Produces(StatusCodes.Status204NoContent)
            .RequireAuthorization(Permissions.SimulatorView);
}
