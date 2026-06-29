// API configuration
const JOKE_API = 'https://v2.jokeapi.dev/joke/';
let currentJoke = null;
let jokeCount = 0;
let currentCategory = 'general';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    displayFavorites();
    // Load initial joke
    getJoke();
});

/**
 * Fetch joke from API with selected category
 */
async function getJoke() {
    const getJokeBtn = document.getElementById('getJokeBtn');
    const jokeDisplay = document.getElementById('jokeDisplay');
    const loading = document.getElementById('loading');
    const jokeContent = document.getElementById('jokeContent');

    // Show loading state
    getJokeBtn.disabled = true;
    jokeContent.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        // Set category for API
        let apiCategory = currentCategory === 'general' ? 'Any' : currentCategory;
        
        // Fetch from JokeAPI
        const response = await fetch(`${JOKE_API}${apiCategory}?type=single`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch joke');
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.message || 'Failed to fetch joke');
        }

        // Store current joke
        currentJoke = {
            text: data.joke,
            category: data.category,
            type: data.type,
            timestamp: new Date().toLocaleTimeString()
        };

        // Display joke
        displayJoke(data);

        // Update stats
        jokeCount++;
        updateStats();

        // Enable action buttons
        document.getElementById('shareBtn').disabled = false;
        document.getElementById('copyBtn').disabled = false;

    } catch (error) {
        console.error('Error fetching joke:', error);
        showNotification('Failed to load joke. Please try again.', 'error');
        jokeContent.innerHTML = '<p style="color: #ff6b6b; font-size: 1.1rem;">⚠️ Unable to load joke. Please check your internet connection.</p>';
        jokeContent.classList.remove('hidden');
    } finally {
        // Hide loading state
        getJokeBtn.disabled = false;
        loading.classList.add('hidden');
    }
}

/**
 * Display joke on page
 */
function displayJoke(jokeData) {
    const jokeContent = document.getElementById('jokeContent');
    const jokeText = document.getElementById('jokeText');
    const jokeCategory = document.getElementById('jokeCategory');

    jokeText.textContent = jokeData.joke;
    jokeCategory.textContent = jokeData.category;

    jokeContent.classList.remove('hidden');
}

/**
 * Set category and fetch new joke
 */
function setCategory(category) {
    currentCategory = category;

    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });

    // Fetch new joke
    getJoke();
}

/**
 * Share joke using Web Share API
 */
function shareJoke() {
    if (!currentJoke) return;

    if (navigator.share) {
        navigator.share({
            title: 'Check out this joke!',
            text: currentJoke.text,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        copyJoke();
    }
}

/**
 * Copy joke to clipboard
 */
function copyJoke() {
    if (!currentJoke) return;

    navigator.clipboard.writeText(currentJoke.text).then(() => {
        showNotification('✓ Joke copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy. Please try again.', 'error');
    });
}

/**
 * Add joke to favorites (localStorage)
 */
function addToFavorites(joke = currentJoke) {
    if (!joke) return;

    let favorites = JSON.parse(localStorage.getItem('favoriteJokes')) || [];

    // Avoid duplicates
    if (!favorites.some(fav => fav.text === joke.text)) {
        favorites.push(joke);
        localStorage.setItem('favoriteJokes', JSON.stringify(favorites));
        updateStats();
        displayFavorites();
        showNotification('♥ Added to favorites!');
    }
}

/**
 * Remove joke from favorites
 */
function removeFromFavorites(jokeText) {
    let favorites = JSON.parse(localStorage.getItem('favoriteJokes')) || [];
    favorites = favorites.filter(fav => fav.text !== jokeText);
    localStorage.setItem('favoriteJokes', JSON.stringify(favorites));
    updateStats();
    displayFavorites();
    showNotification('Removed from favorites');
}

/**
 * Display favorite jokes
 */
function displayFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    const favorites = JSON.parse(localStorage.getItem('favoriteJokes')) || [];

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-message">No favorite jokes yet. Click the heart to save!</p>';
        return;
    }

    favoritesList.innerHTML = favorites.map((joke, index) => `
        <div class="favorite-item">
            <div class="favorite-item-text">
                <strong>#${favorites.length - index}</strong><br>
                ${joke.text}
            </div>
            <div class="favorite-item-actions">
                <button title="Copy" onclick="copyFavoriteJoke('${joke.text.replace(/'/g, "\\'")}')">
                    <i class="fas fa-copy"></i>
                </button>
                <button title="Share" onclick="shareFavoriteJoke('${joke.text.replace(/'/g, "\\'")}')">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="remove-btn" title="Remove" onclick="removeFromFavorites('${joke.text.replace(/'/g, "\\'")}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Copy favorite joke to clipboard
 */
function copyFavoriteJoke(jokeText) {
    navigator.clipboard.writeText(jokeText).then(() => {
        showNotification('✓ Joke copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy.', 'error');
    });
}

/**
 * Share favorite joke
 */
function shareFavoriteJoke(jokeText) {
    if (navigator.share) {
        navigator.share({
            title: 'Check out this joke!',
            text: jokeText,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        copyFavoriteJoke(jokeText);
    }
}

/**
 * Clear all favorites
 */
function clearFavorites() {
    if (confirm('Are you sure you want to clear all favorites?')) {
        localStorage.removeItem('favoriteJokes');
        updateStats();
        displayFavorites();
        showNotification('All favorites cleared');
    }
}

/**
 * Update statistics
 */
function updateStats() {
    const favorites = JSON.parse(localStorage.getItem('favoriteJokes')) || [];
    document.getElementById('jokeCount').textContent = jokeCount;
    document.getElementById('favoriteCount').textContent = favorites.length;
    saveStats();
}

/**
 * Load statistics from localStorage
 */
function loadStats() {
    const stats = JSON.parse(localStorage.getItem('jokeStats')) || { count: 0 };
    jokeCount = stats.count;
    updateStats();
}

/**
 * Save statistics to localStorage
 */
function saveStats() {
    localStorage.setItem('jokeStats', JSON.stringify({ count: jokeCount }));
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Save stats before leaving page
 */
window.addEventListener('beforeunload', () => {
    saveStats();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        getJoke();
    }
    if (e.key === 'f' && e.ctrlKey) {
        e.preventDefault();
        addToFavorites();
    }
});