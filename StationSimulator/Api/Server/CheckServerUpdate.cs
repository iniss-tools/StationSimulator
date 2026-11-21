using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Server;
using StationSimulator.Contracts.Server;

namespace StationSimulator.Api.Server;

/// <summary>POST /api/server/update/check - zisti novu verziu servera hned.</summary>
public sealed class CheckServerUpdate : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("server/update/check", async (ICommandHandler<CheckServerUpdateCommand, ServerUpdateDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new CheckServerUpdateCommand(), cancellationToken)).Match(Results.Ok, CustomResults.Problem))
            .Produces<ServerUpdateDto>()
            .RequireAuthorization(Policies.ServerView);
}
