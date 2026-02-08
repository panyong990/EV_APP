// Scoped users admin script — supports being embedded into combined admin panel
document.addEventListener('DOMContentLoaded', () => {
  let users = [];
  const root = document.querySelector('#users') || document;
  const tableBody = root.querySelector('#usersTable') || document.getElementById('usersTable');
  const searchInput = root.querySelector('#users_searchInput') || document.getElementById('searchInput');
  const statusFilter = root.querySelector('#users_statusFilter') || document.getElementById('statusFilter');

  if (!tableBody) return; // not on this page

  // Fetch users data from API
  async function fetchUsers() {
    try {
      const apiUrl = "/EV_APP/BACKEND/API/ANALYTICS/get_all_users.php";
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      users = data;
      renderUsers();
    } catch (error) {
      console.error("Error fetching users:", error);
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ef4444;">Error loading user data: ' + error.message + '</td></tr>';
    }
  }

  function renderUsers() {
    const filter = (searchInput?.value || '').toLowerCase();
    const status = statusFilter?.value || '';

    tableBody.innerHTML = "";

    const filtered = users.filter(user => 
      ((user.name || '').toLowerCase().includes(filter) || (user.email || '').toLowerCase().includes(filter)) &&
      (status === "" || user.status === status) &&
      (user.role?.toLowerCase() !== 'admin')
    );

    if (filtered.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #6b7280;">No users found</td></tr>';
      return;
    }

    filtered.forEach(user => {
      const row = document.createElement("tr");
      const evCount = (user.evs > 0) ? user.evs : '<span style="color: #d1d5db;">—</span>';
      const statusClass = (user.status === "Active") ? "status-active" : (user.status === "Unverified") ? "status-unverified" : "status-inactive";

      row.innerHTML = `
        <td class="user-name">${user.name || ''}</td>
        <td class="text-muted">${user.email || ''}</td>
        <td class="text-muted">${evCount}</td>
        <td>
          <span class="status-pill ${statusClass}">
            ${user.status || ''}
          </span>
        </td>
        <td class="text-muted">${user.joined || ''}</td>
        <td class="action-cell">
          <button class="kebab-btn" data-userid="${user.id}" title="View energy metrics">
            <i data-lucide="bar-chart-2" style="width: 16px; height: 16px; stroke-width: 2;"></i>
          </button>
          <div id="stats-${user.id}" class="stats-popover">
            <div class="stat-row"><span class="stat-label">Efficiency</span><span class="stat-value">${user.efficiency || '—'}</span></div>
            <div class="stat-row"><span class="stat-label">Energy Saved</span><span class="stat-value">${user.saved || '—'}</span></div>
            <div class="stat-row"><span class="stat-label">Energy Used</span><span class="stat-value">${user.used || '—'}</span></div>
          </div>
        </td>
      `;

      tableBody.appendChild(row);
    });
    lucide.createIcons();
  }

  // Event listeners
  searchInput?.addEventListener("input", renderUsers);
  statusFilter?.addEventListener("change", renderUsers);

  // Initial fetch and render
  fetchUsers();

  // Toggle stats popover — append/populate a bubble near the clicked button
  tableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('.kebab-btn');
    if (!btn) return;
    const userId = btn.getAttribute('data-userid');

    // Close any visible popovers
    document.querySelectorAll('.stats-popover.show').forEach(p => p.classList.remove('show'));

    // Find the stats element (may be inside the row as #stats-<id>)
    let source = document.getElementById(`stats-${userId}`);
    if (!source) {
      // Maybe the template isn't in DOM; create minimal content
      source = document.createElement('div');
      source.id = `stats-${userId}`;
      source.className = 'stats-popover';
      source.innerHTML = `<div class="stat-row"><span class="stat-label">Efficiency</span><span class="stat-value">—</span></div><div class="stat-row"><span class="stat-label">Energy Saved</span><span class="stat-value">—</span></div><div class="stat-row"><span class="stat-label">Energy Used</span><span class="stat-value">—</span></div>`;
    }

    // Clone to body so it can float above overflow:hidden tables
    let bubble = document.querySelector(`body > #bubble-stats-${userId}`);
    if (bubble) {
      // toggle
      bubble.classList.toggle('show');
      return;
    }

    bubble = source.cloneNode(true);
    bubble.id = `bubble-stats-${userId}`;
    bubble.style.position = 'absolute';
    bubble.style.display = 'flex';
    bubble.classList.add('show');

    document.body.appendChild(bubble);

    // Position it near the button
    const rect = btn.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();
    const left = rect.right + 8;
    let top = rect.top + window.scrollY - 8;
    // keep inside viewport vertically
    if (top + bubble.offsetHeight > window.innerHeight + window.scrollY) {
      top = window.scrollY + window.innerHeight - bubble.offsetHeight - 12;
    }
    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;

    // Close when clicking elsewhere
    const onDocClick = (ev) => {
      if (!ev.target.closest(`#bubble-stats-${userId}`) && !ev.target.closest('.kebab-btn')) {
        bubble.classList.remove('show');
        bubble.remove();
        document.removeEventListener('click', onDocClick);
      }
    };
    setTimeout(() => document.addEventListener('click', onDocClick), 10);
  });

});
