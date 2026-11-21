using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Routing;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Auth;
using StationSimulator.Application.Signage;
using StationSimulator.Contracts.Signage;

namespace StationSimulator.Api.Signage;

/// <summary>POST /api/signage/media?name= - obrazok alebo video spravy (telo = subor).</summary>
public sealed class UploadSignageMedia : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app) =>
        app.MapPost("signage/media", async (HttpRequest request, string? name, ICommandHandler<UploadSignageMediaCommand, SignageMediaDto> handler,
            CancellationToken cancellationToken) =>
        {
            // video je vacsie nez predvoleny limit tela poziadavky; vacsi subor zastavi az handler
            if (request.HttpContext.Features.Get<IHttpMaxRequestBodySizeFeature>() is { IsReadOnly: false } limit)
                limit.MaxRequestBodySize = SignageMediaStore.MaxBytes + 1;
            var result = await handler.Handle(new UploadSignageMediaCommand(name ?? "", request.Body), cancellationToken);
            return result.Match(Results.Ok, CustomResults.Problem);
        })
            .Accepts<Stream>("application/octet-stream")
            .Produces<SignageMediaDto>()
            .RequireAuthorization(Permissions.SignageManage);
}
