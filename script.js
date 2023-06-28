const apiKey = "13fba232843c530e3cf1b0c8991db2e6";
const imgApi = "https://image.tmdb.org/t/p/w1280";
const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=`;
const form = document.getElementById("search-form");
const query = document.getElementById("search-input");
const result = document.getElementById("result");
const loadingIndicator = document.getElementById("loading-indicator");
const errorMessage = document.getElementById("error-message");

let page = 1;
let isSearching = false;

// Fetch JSON data from url
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }
        return await response.json();
    } catch (error) {
        throw new Error("An error occurred while fetching data.");
    }
}

// Fetch and show results based on url
async function fetchAndShowResult(url) {
    try {
        loadingIndicator.style.display = "block";
        const data = await fetchData(url);
        if (data && data.results) {
            showResults(data.results);
        } else {
            showErrorMessage("No results found.");
        }
    } catch (error) {
        showErrorMessage(error.message);
    } finally {
        loadingIndicator.style.display = "none";
    }
}

// Create movie card html template
function createMovieCard(movie) {
    const { title, poster_path, vote_average, overview } = movie;
    const imageUrl = poster_path ? imgApi + poster_path : "https://via.placeholder.com/300x450";
    const rating = vote_average ? vote_average : "N/A";

    return `
        <div class="column">
            <div class="card">
                <div class="card-media">
                    <img src="${imageUrl}" alt="${title}">
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <h3>${title}</h3>
                        <span class="card-btn">${rating}</span>
                    </div>
                    <div class="info">${overview}</div>
                </div>
            </div>
        </div>
    `;
}

// Clear result element for search
function clearResults() {
    result.innerHTML = "";
}

// Show results in page
function showResults(items) {
    const newContent = items.map(createMovieCard).join("");
    result.insertAdjacentHTML("beforeend", newContent);
}

// Show error message
function showErrorMessage(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

// Load more results
async function loadMoreResults() {
    if (isSearching) {
        return;
    }
    page++;
    const searchTerm = query.value;
    const url = searchTerm ? `${searchUrl}${searchTerm}&page=${page}` : `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`;
    await fetchAndShowResult(url);
}

// Detect end of page and load more results
function detectEnd() {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
        loadMoreResults();
    }
}

// Handle search
async function handleSearch(e) {
    e.preventDefault();
    const searchTerm = query.value.trim();
    if (searchTerm) {
        isSearching = true;
        clearResults();
        page = 1; // Reset the page to 1 for new search
        const newUrl = `${searchUrl}${searchTerm}&page=${page}`;
        await fetchAndShowResult(newUrl);
        query.value = "";
    }
}

// Event listeners
form.addEventListener("submit", handleSearch);
window.addEventListener("scroll", detectEnd);
window.addEventListener("resize", detectEnd);

// Initialize the page
async function init() {
    clearResults();
    const url = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`;
    isSearching = false;
    await fetchAndShowResult(url);
}

init();