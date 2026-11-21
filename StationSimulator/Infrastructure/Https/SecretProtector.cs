using System.Security.Cryptography;
using Microsoft.AspNetCore.DataProtection;
using StationSimulator.Application.Settings;

namespace StationSimulator.Infrastructure.Https;

/// <summary>Tajne hodnoty nastavenia sifrovane klucmi ochrany dat servera (vo Windows chranenymi cez DPAPI).</summary>
public sealed class SecretProtector(IDataProtectionProvider protection) : ISecretProtector
{
    private readonly IDataProtector _protector = protection.CreateProtector("StationSimulator.Settings.Secrets");

    public string Protect(string value) => string.IsNullOrEmpty(value) ? "" : _protector.Protect(value);

    public string Unprotect(string value)
    {
        if (string.IsNullOrEmpty(value))
            return "";
        try
        {
            return _protector.Unprotect(value);
        }
        catch (CryptographicException)
        {
            return "";
        }
    }
}
