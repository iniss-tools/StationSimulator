using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Contracts.Auth;

namespace StationSimulator.Api.Auth;

/// <summary>POST /api/auth/setup - prvy spravca (len kym nie je ziaden pouzivatel a len z tohto pocitaca).</summary>
public sealed class Setup : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("auth/setup", async (SetupRequest request, ICommandHandler<SetupCommand, MeDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new SetupCommand(request.UserName ?? "", request.DisplayName ?? "", request.Password ?? ""), cancellationToken))
            .Match(Results.Ok, CustomResults.Problem))
            .Produces<MeDto>()
            .AllowAnonymous();
}
