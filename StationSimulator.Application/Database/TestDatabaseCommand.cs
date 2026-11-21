using FluentValidation;
using StationSimulator.Application.Abstractions.Messaging;
using StationSimulator.Application.Abstractions.Results;
using StationSimulator.Application.Audit;
using StationSimulator.Contracts.Database;

namespace StationSimulator.Application.Database;

/// <summary>Skusi pripojenie k PostgreSQL podla formulara (heslo null = ulozene).</summary>
public sealed record TestDatabaseCommand(PostgresSettingsRequest Request) : ICommand<DatabaseTestResultDto>, IAuditable
{
    string IAuditable.AuditTarget => "database";
}

public sealed class TestDatabaseCommandValidator : AbstractValidator<TestDatabaseCommand>
{
    public TestDatabaseCommandValidator() => RuleFor(c => c.Request).NotNull().WithErrorCode(DatabaseErrors.Host).SetValidator(new PostgresSettingsRules());
}

public sealed class TestDatabaseCommandHandler(IDatabaseSettings database) : ICommandHandler<TestDatabaseCommand, DatabaseTestResultDto>
{
    public async Task<Result<DatabaseTestResultDto>> Handle(TestDatabaseCommand command, CancellationToken cancellationToken) =>
        Result.Success(await database.TestAsync(command.Request, cancellationToken).ConfigureAwait(false));
}
