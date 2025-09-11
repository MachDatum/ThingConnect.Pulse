# ThingConnect.Pulse.Tests

Standalone test project for ThingConnect Pulse configuration validation and CIDR expansion functionality.

## Running Tests

```bash
# Run all tests
dotnet test

# Run with verbose output
dotnet test --logger "console;verbosity=detailed"

# Run specific test
dotnet test --filter "TestName=TestConfigurationValidation_WithValidYaml_ShouldPassValidation"
```

## Test Coverage

### ConfigurationValidationTests

- ✅ **TestConfigurationValidation_WithValidYaml_ShouldPassValidation**
  - Validates that the provided YAML configuration passes JSON schema validation
  - Uses your exact YAML configuration from `test-config.yaml`

- ✅ **TestCidrExpansion_With24Subnet_ShouldReturn254IPs**
  - Tests CIDR expansion for `/24` subnet
  - Verifies that `10.18.8.0/24` expands to 254 IPs (10.18.8.1 to 10.18.8.254)

- ✅ **TestCidrExpansion_With30Subnet_ShouldReturn2IPs**
  - Tests CIDR expansion for `/30` subnet
  - Verifies that `192.168.1.0/30` expands to 2 IPs (192.168.1.1 to 192.168.1.2)

- ✅ **TestCidrExpansion_WithInvalidFormat_ShouldReturnEmpty**
  - Tests error handling for invalid CIDR format
  - Verifies that invalid inputs return empty results

## Test Files

- `test-config.yaml` - Your exact configuration for testing
- `config.schema.json` - JSON schema for validation
- `ConfigurationValidationTests.cs` - NUnit test class

## Key Validations

1. **Schema Validation**: Your YAML passes all schema validation rules
2. **CIDR Expansion Logic**: Confirms that CIDR ranges expand correctly to individual IPs
3. **Error Handling**: Tests invalid inputs are handled gracefully

This test project validates that the fixes for CIDR expansion and schema validation are working correctly.