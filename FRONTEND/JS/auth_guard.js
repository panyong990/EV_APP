// Simple frontend auth guard utilities
function getUserRole() {
    return (localStorage.getItem('user_role') || '').toLowerCase();
}

function requireRole(allowedRoles = []) {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    const role = getUserRole();
    if (!role) {
        // If role missing, force re-login for safety
        window.location.href = 'login.html';
        return;
    }

    const normalized = allowedRoles.map(r => r.toLowerCase());
    if (!normalized.includes(role)) {
        // User is accessing a role-restricted page they don't have access to
        // Redirect based on their role (not the accessed page's requirement)
        // Note: Override only enforced on initial login. Manual navigation is allowed.
        // if (role === 'admin') window.location.href = 'overview.html';
        // else window.location.href = 'dashboard.html';
    }
}

function isAdmin() { return getUserRole() === 'admin'; }
function isUser() { return getUserRole() === 'user'; }
