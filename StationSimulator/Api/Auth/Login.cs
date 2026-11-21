using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Contracts.Auth;

namespace StationSimulator.Api.Auth;

/// <summary>POST /api/auth/login - prihlasenie menom a heslom (cookie).</summary>
public sealed class Login : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("auth/login", async (LoginRequest request, ICommandHandler<LoginCommand, MeDto> handler, CancellationToken cancellationToken) =>
            (await handler.Handle(new LoginCommand(request.UserName ?? "", request.Password ?? "", request.Remember), cancellationToken))
            .Match(Results.Ok, CustomResults.Problem))
            .Produces<MeDto>()
            .AllowAnonymous();
}
