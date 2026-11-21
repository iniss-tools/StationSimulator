using StationSimulator.Application.Abstractions.Messaging;

namespace StationSimulator.Application.Https;

/// <summary>Certifikat, ktoremu maju zariadenia doverovat (na nainstalovanie).</summary>
public sealed record GetHttpsCertificateQuery : IQuery<HttpsCertificateFile>;
