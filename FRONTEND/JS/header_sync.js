// Sync header avatar and name across pages from localStorage
(function(){
  function updateHeader() {
    try {
      const avatar = localStorage.getItem('avatar_url');
      const name = localStorage.getItem('full_display_name') || '';

      if (avatar) {
        document.querySelectorAll('img[alt="Profile"], img[alt="Avatar"], img.profile-avatar').forEach(img => {
          img.src = avatar;
        });
      }

      const headerInitials = document.getElementById('headerInitials');
      if (headerInitials && name) {
        const parts = name.trim().split(/\s+/).slice(0,2);
        const initials = parts.map(p=>p? p[0].toUpperCase(): '').join('') || 'U';
        headerInitials.textContent = initials;
      }

      const headerNameEl = document.getElementById('header-user-name');
      if (headerNameEl && name) headerNameEl.textContent = name;
      document.querySelectorAll('.header-user-name').forEach(el => { if (name) el.textContent = name; });
    } catch (e) { /* noop */ }
  }

  // Run on load
  updateHeader();

  // Update reactively when other tabs/pages change localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === 'avatar_url' || e.key === 'full_display_name') updateHeader();
  });
})();