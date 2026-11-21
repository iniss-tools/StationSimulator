using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;

namespace StationSimulator.Application.Https;

public sealed class GetHttpsCertificateQueryHandler(IHttpsCertificates certificates) : IQueryHandler<GetHttpsCertificateQuery, HttpsCertificateFile>
{
    public Task<Result<HttpsCertificateFile>> Handle(GetHttpsCertificateQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(certificates.TrustedCertificate() is { } file ? Result.Success(file) : Result.Failure<HttpsCertificateFile>(HttpsErrors.Disabled()));
}
