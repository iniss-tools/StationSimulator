using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Contracts.Https;

namespace StationSimulator.Application.Https;

public sealed class GetHttpsStatusQueryHandler(IHttpsCertificates certificates) : IQueryHandler<GetHttpsStatusQuery, HttpsStatusDto>
{
    public Task<Result<HttpsStatusDto>> Handle(GetHttpsStatusQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(Result.Success(certificates.Status()));
}
