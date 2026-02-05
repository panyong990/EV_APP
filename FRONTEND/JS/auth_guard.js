// Simple frontend auth guard utilities
function getUserRole() {
    return (localStorage.getItem('user_role') || '').toLowerCase();
}

function requireRole(allowedRoles = []) {
    const userId = localStorage.getItem('user_id');
    const role = getUserRole();

    // Debug logging to help trace role-based redirects
    try {
        console.debug('[auth_guard] requireRole called', { allowedRoles, userId, role });
    } catch (e) {}

    if (!userId) {
        // Not logged in
        window.location.replace('login.html');
        return;
    }

    if (!role) {
        // Missing role — force re-login
        window.location.replace('login.html');
        return;
    }

    const normalized = allowedRoles.map(r => String(r).toLowerCase());
    if (!normalized.includes(role)) {
        // User is accessing a role-restricted page they don't have access to
        // Redirect based on their role
        if (role === 'admin') {
            console.debug('[auth_guard] redirecting admin to overview');
            window.location.replace('overview.html');
            return;
        } else if (role === 'user') {
            console.debug('[auth_guard] redirecting user to dashboard');
            window.location.replace('dashboard.html');
            return;
        } else {
            window.location.replace('login.html');
            return;
        }
    }
}

function isAdmin() { return getUserRole() === 'admin'; }
function isUser() { return getUserRole() === 'user'; }

// Auto-enforce role if page declares a required role via meta tag or body dataset
document.addEventListener('DOMContentLoaded', function () {
    try {
        var meta = document.querySelector('meta[name="required-role"]');
        var required = null;
        if (meta && meta.content) required = meta.content;
        if (!required && document.body && document.body.dataset && document.body.dataset.requiredRole) required = document.body.dataset.requiredRole;
        if (required) {
            try {
                requireRole([required]);
            } catch (e) {
                console.debug('[auth_guard] auto-requireRole failed', e);
            }
        }
    } catch (e) {}
});
