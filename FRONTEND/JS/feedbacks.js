// Feedbacks admin page script (scoped / compatible with combined admin-panel)
document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#feedbacks') || document;
  const tableBody = root.querySelector('#feedbacksTableBody') || document.getElementById('feedbacksTableBody');
  const emptyState = root.querySelector('#emptyState') || document.getElementById('emptyState');
  const searchInput = root.querySelector('#feedback_searchInput') || document.getElementById('searchInput');
  const ratingFilter = root.querySelector('#feedback_ratingFilter') || document.getElementById('ratingFilter');
  const sortBy = root.querySelector('#feedback_sortBy') || document.getElementById('sortBy');
  const totalFeedbacksCount = root.querySelector('#totalFeedbacksCount') || document.getElementById('totalFeedbacksCount');
  const avgRatingDisplay = root.querySelector('#avgRating') || document.getElementById('avgRating');

  if (!tableBody) return;

  let allFeedbacks = [];

  // Map sources (can be extended if backend provides source data)
  const sourceMap = {
    'app': 'App',
    'trip_planner': 'Trip Planner',
    'charging_hub': 'Charging Hub',
    'profile': 'Profile',
    'analytics': 'Analytics'
  };

  async function loadFeedbacks() {
    try {
      const res = await fetch('/EV_APP/BACKEND/API/FEEDBACK/get_all_feedbacks.php');
      if (!res.ok) {
        console.warn('Feedbacks API returned non-ok response, falling back to empty');
        allFeedbacks = [];
      } else {
        const data = await res.json();
        allFeedbacks = data.feedbacks || [];
      }
    } catch (error) {
      console.warn('Could not load feedbacks from backend', error);
      allFeedbacks = [];
    }

    updateStats();
    displayFeedbacks();
  }

  // Update summary statistics
  function updateStats() {
    const total = allFeedbacks.length;
    const ratings = allFeedbacks.map(f => f.rating).filter(r => r);
    const avgRating = ratings.length > 0 
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : 0;

    if (totalFeedbacksCount) totalFeedbacksCount.textContent = total;
    if (avgRatingDisplay) avgRatingDisplay.textContent = avgRating;
  }

  // Sort feedbacks based on selected sort option
  function sortFeedbacks(feedbacks) {
    const sorted = [...feedbacks];
    const sortValue = sortBy?.value || '';

    if (sortValue === 'date-desc' || sortValue === 'newest') {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortValue === 'date-asc' || sortValue === 'oldest') {
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortValue === 'rating-desc') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortValue === 'rating-asc') {
      sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
    }

    return sorted;
  }

  // Display feedbacks in table format with filters
  function displayFeedbacks() {
    const searchTerm = (searchInput?.value || '').toLowerCase();
    const selectedRating = ratingFilter?.value || '';

    let filtered = allFeedbacks.filter(feedback => {
      const matchesSearch = feedback.text && feedback.text.toLowerCase().includes(searchTerm);
      const matchesRating = !selectedRating || feedback.rating == selectedRating;
      return matchesSearch && matchesRating;
    });

    // Apply sorting
    filtered = sortFeedbacks(filtered);

    if (filtered.length === 0) {
      showEmptyState('No feedbacks match your filters');
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    tableBody.innerHTML = filtered.map(feedback => createTableRow(feedback)).join('');
  }

  // Show empty state
  function showEmptyState(message) {
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.querySelector('p').textContent = message;
    }
    tableBody.innerHTML = '';
  }

  // Create table row for feedback
  function createTableRow(feedback) {
    const rating = parseInt(feedback.rating) || 0;
    const ratingDisplay = `
      <span style="display:inline-flex; align-items:center; gap:8px; color: #6b7280; font-weight:600;">
        <span style="font-size:0.95rem;">${rating}</span>
        <span aria-hidden="true" style="font-size:16px; line-height:1; color: #6b7280;">★</span>
      </span>
    `;

    const date = new Date(feedback.created_at || new Date());
    const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const categoryDisplay = feedback.category || sourceMap[feedback.source?.toLowerCase()] || feedback.source || 'App';
    // status removed per UI preference

    const feedbackText = escapeHtml(feedback.text || '(No comment)');
    const truncatedText = feedbackText.length > 100 ? feedbackText.substring(0, 100) + '...' : feedbackText;

    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="text-align: center; padding: 12px 0; color: #6b7280;">${ratingDisplay}</td>
        <td style="text-align: left; padding: 12px 0; color: #374151; font-size: 0.9375rem;" title="${feedbackText}">${truncatedText}</td>
        <td style="text-align: left; padding: 12px 0; color: #6b7280; font-size: 0.875rem;">${escapeHtml(categoryDisplay)}</td>
        <td style="text-align: left; padding: 12px 0; color: #6b7280; font-size: 0.875rem;">${dateStr}<br><span style="font-size: 0.8125rem; color: #9ca3af;">${timeStr}</span></td>
      </tr>
    `;
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  // Event listeners for filters and sorting
  searchInput?.addEventListener('input', displayFeedbacks);
  ratingFilter?.addEventListener('change', displayFeedbacks);
  sortBy?.addEventListener('change', displayFeedbacks);

  // Initial load
  loadFeedbacks();
});
