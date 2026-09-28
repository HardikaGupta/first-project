const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const statusMessage = document.getElementById('status-message');
const resultsGrid = document.getElementById('results-grid');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (query) {
    searchImages(query);
  }
});

async function searchImages(query) {
  // 1. LOADING STATE: Show loading UI before fetch starts
  statusMessage.textContent = 'Searching...';
  resultsGrid.innerHTML = ''; // Clear previous results

  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
    query
  )}&gsrlimit=12&prop=pageimages&piprop=thumbnail&pithumbsize=400&format=json&origin=*`;

  try {
    const response = await fetch(url);

    // Check response status
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if query results exist
    if (!data.query || !data.query.pages) {
      // 2. EMPTY STATE: No results found
      statusMessage.textContent = `No results for "${query}". Try another search.`;
      return;
    }

    const items = Object.values(data.query.pages);

    if (items.length === 0) {
      statusMessage.textContent = `No results for "${query}". Try another search.`;
      return;
    }

    // 3. RESULTS STATE: Display data and result count
    statusMessage.textContent = `Showing ${items.length} results for "${query}".`;
    renderResults(items);

  } catch (error) {
    // 4. ERROR STATE: Show user-friendly error message on network failure
    console.error('Fetch error:', error);
    statusMessage.textContent = 'Something went wrong. Please check your network connection and try again.';
  }
}

function renderResults(items) {
  resultsGrid.innerHTML = '';
  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'card';

    const imageUrl = item.thumbnail ? item.thumbnail.source : 'https://via.placeholder.com/300?text=No+Image';
    const title = item.title.replace('File:', '');

    card.innerHTML = `
      <img src="${imageUrl}" alt="${title}" loading="lazy" />
      <p>${title}</p>
    `;
    resultsGrid.appendChild(card);
  });
}