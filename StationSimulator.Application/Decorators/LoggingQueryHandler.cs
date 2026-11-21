using System.Diagnostics;
using Microsoft.Extensions.Logging;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;

namespace StationSimulator.Application.Decorators;

/// <summary>Zaznam vybavenia dotazu (cas, pripadne chyba).</summary>
public sealed class LoggingQueryHandler<TQuery, TResponse>(
    IQueryHandler<TQuery, TResponse> innerHandler,
    ILogger<LoggingQueryHandler<TQuery, TResponse>> logger)
    : IQueryHandler<TQuery, TResponse>
    where TQuery : IQuery<TResponse>
{
    public async Task<Result<TResponse>> Handle(TQuery query, CancellationToken cancellationToken)
    {
        var started = Stopwatch.GetTimestamp();
        var result = await innerHandler.Handle(query, cancellationToken).ConfigureAwait(false);
        LoggingDecorator.Log(logger, typeof(TQuery).Name, result, started, false);
        return result;
    }
}
