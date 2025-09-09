using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using ThingConnect.Pulse.Server.Data;

namespace ThingConnect.Pulse.Server.Infrastructure;

/// <summary>
/// Custom claims principal factory to add role claims from ApplicationUser.Role property
/// </summary>
public sealed class ApplicationUserClaimsPrincipalFactory : UserClaimsPrincipalFactory<ApplicationUser, IdentityRole>
{
    public ApplicationUserClaimsPrincipalFactory(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IOptions<IdentityOptions> optionsAccessor)
        : base(userManager, roleManager, optionsAccessor)
    {
    }

    protected override async Task<ClaimsIdentity> GenerateClaimsAsync(ApplicationUser user)
    {
        var identity = await base.GenerateClaimsAsync(user);
        
        // Add the role claim from the custom Role property
        if (!string.IsNullOrEmpty(user.Role))
        {
            identity.AddClaim(new Claim(ClaimTypes.Role, user.Role));
        }

        return identity;
    }
}