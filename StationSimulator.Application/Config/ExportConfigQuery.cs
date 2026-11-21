using StationSimulator.Application.Abstractions.Messaging;

namespace StationSimulator.Application.Config;

/// <summary>Linky a tabule ako subor JSON (rovnaky tvar ako povodny <c>config.json</c>).</summary>
public sealed record ExportConfigQuery : IQuery<ConfigFile>;
