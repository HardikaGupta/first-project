// Get references to DOM elements
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results");

// Optional Enhancement: Create or reference a result counter element
let countDisplay = document.getElementById("results-count");
if (!countDisplay) {
  countDisplay = document.createElement("p");
  countDisplay.id = "results-count";
  countDisplay.className = "results-count";
  // Insert counter above the results container
  resultsContainer.parentNode.insertBefore(countDisplay, resultsContainer);
}

// 1. Catch the search event
searchForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Stop default form submission / page reload

  // Read query and remove extra whitespace
  const query = searchInput.value.trim();

  // 4. Ignore empty searches
  if (!query) {
    return;
  }

  try {
    // 2. Fetch the data
    const url =
      "https://commons.wikimedia.org/w/api.php?action=query&generator=search" +
      "&gsrsearch=" + encodeURIComponent(query) +
      "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*";

    const response = await fetch(url);

    // Check if the request succeeded
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Extract pages from response object if present
    const pages = data.query ? data.query.pages : null;
    const items = pages ? Object.values(pages) : [];

    // Render results to DOM
    renderResults(items, query);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

// 3. Render the results into the DOM
function renderResults(items, query) {
  // Clear previous results and counter
  resultsContainer.innerHTML = "";

  // Enhancement: Update result count display
  if (items.length === 0) {
    countDisplay.textContent = `No results found for "${query}".`;
    return;
  }
  
  countDisplay.textContent = `Showing ${items.length} result${items.length > 1 ? "s" : ""} for "${query}"`;

  // Loop through items and generate HTML cards
  items.forEach((item) => {
    // Safely verify image thumbnail exists
    const imageInfo = item.imageinfo && item.imageinfo[0];
    if (!imageInfo || !imageInfo.thumburl) return;

    // Create card container
    const card = document.createElement("article");
    card.className = "card";

    // Create thumbnail image element
    const img = document.createElement("img");
    img.src = imageInfo.thumburl;
    img.alt = item.title || "Search result image";

    // Create title element
    const title = document.createElement("p");
    title.className = "card-title";
    title.textContent = item.title;

    // Enhancement: Make the card a clickable link to view full size image in a new tab
    if (imageInfo.url) {
      const link = document.createElement("a");
      link.href = imageInfo.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      
      link.appendChild(img);
      link.appendChild(title);
      card.appendChild(link);
    } else {
      card.appendChild(img);
      card.appendChild(title);
    }

    // Append card to grid container
    resultsContainer.appendChild(card);
  });
}