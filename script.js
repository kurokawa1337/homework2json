const API_KEY = '5a56827c'; 
const API_URL = 'https://www.omdbapi.com/';

const form = document.getElementById('search-form');
const titleInput = document.getElementById('title');
const typeInput = document.getElementById('type');
const moviesList = document.getElementById('movies-list');
const pagination = document.getElementById('pagination');
const resultsWrapper = document.getElementById('results-wrapper');
const errorMsg = document.getElementById('error-message');
const detailsWrapper = document.getElementById('details-wrapper');
const movieDetails = document.getElementById('movie-details');

let currentQuery = '';
let currentType = '';
let currentPage = 1;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    currentQuery = titleInput.value.trim();
    currentType = typeInput.value;
    currentPage = 1;
    
    detailsWrapper.hidden = true;
    await fetchMovies();
});

async function fetchMovies() {
    if (!currentQuery) return;

    try {
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${currentQuery}&type=${currentType}&page=${currentPage}`);
        const data = await response.json();

        if (data.Response === "True") {
            errorMsg.hidden = true;
            resultsWrapper.hidden = false;
            renderMovies(data.Search);
            renderPagination(parseInt(data.totalResults));
        } else {
            errorMsg.hidden = false;
            resultsWrapper.hidden = true;
            detailsWrapper.hidden = true;
        }
    } catch (error) {
        console.error(error);
    }
}

function renderMovies(movies) {
    moviesList.innerHTML = '';
    
    movies.forEach(movie => {
        const card = document.createElement('div');
        card.classList.add('movie-card');
        
        const posterSrc = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/100x140?text=No+Poster';
        
        card.innerHTML = `
            <img src="${posterSrc}" alt="${movie.Title}">
            <div class="movie-info">
                <span>${movie.Type}</span>
                <h3>${movie.Title}</h3>
                <span class="year">${movie.Year}</span>
                <button class="details-btn" data-id="${movie.imdbID}">Details</button>
            </div>
        `;
        moviesList.appendChild(card);
    });

    const detailBtns = document.querySelectorAll('.details-btn');
    detailBtns.forEach(btn => {
        btn.addEventListener('click', () => fetchDetails(btn.dataset.id));
    });
}

function renderPagination(totalResults) {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(totalResults / 10);
    
    if (totalPages <= 1) return;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 3);

    const prevBtn = document.createElement('button');
    prevBtn.classList.add('page-btn');
    prevBtn.textContent = '<<';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchMovies();
        }
    });
    pagination.appendChild(prevBtn);

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.classList.add('page-btn');
        if (i === currentPage) btn.classList.add('active');
        btn.textContent = i;
        btn.addEventListener('click', () => {
            currentPage = i;
            fetchMovies();
        });
        pagination.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.classList.add('page-btn');
    nextBtn.textContent = '>>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchMovies();
        }
    });
    pagination.appendChild(nextBtn);
}

async function fetchDetails(id) {
    try {
        const response = await fetch(`${API_URL}?apikey=${API_KEY}&i=${id}`);
        const data = await response.json();
        
        if (data.Response === "True") {
            renderDetails(data);
        }
    } catch (error) {
        console.error(error);
    }
}

function renderDetails(movie) {
    detailsWrapper.hidden = false;
    
    const posterSrc = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/250x350?text=No+Poster';
    
    movieDetails.innerHTML = `
        <img src="${posterSrc}" alt="${movie.Title}">
        <div class="details-table">
            <div class="detail-row"><div class="label">Title:</div><div class="value">${movie.Title}</div></div>
            <div class="detail-row"><div class="label">Released:</div><div class="value">${movie.Released}</div></div>
            <div class="detail-row"><div class="label">Genre:</div><div class="value">${movie.Genre}</div></div>
            <div class="detail-row"><div class="label">Country:</div><div class="value">${movie.Country}</div></div>
            <div class="detail-row"><div class="label">Director:</div><div class="value">${movie.Director}</div></div>
            <div class="detail-row"><div class="label">Writer:</div><div class="value">${movie.Writer}</div></div>
            <div class="detail-row"><div class="label">Actors:</div><div class="value">${movie.Actors}</div></div>
            <div class="detail-row"><div class="label">Awards:</div><div class="value">${movie.Awards}</div></div>
        </div>
    `;
    
    detailsWrapper.scrollIntoView({ behavior: 'smooth' });
}