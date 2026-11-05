document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultsGrid = document.getElementById('resultsGrid');
    const searchTitle = document.getElementById('searchTitle');

    // Toggle clear button visibility
    searchInput.addEventListener('input', () => {
        clearBtn.classList.toggle('visible', searchInput.value.trim().length > 0);
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.remove('visible');
        searchInput.focus();
        resetMenu();
    });

    // Render multi-platform options on search submit
    searchBtn.addEventListener('click', generatePlatformMenu);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') generatePlatformMenu();
    });

    function generatePlatformMenu() {
        const query = searchInput.value.trim();
        if (!query) return;

        const encodedQuery = encodeURIComponent(query);
        const cleanHashtag = query.replace(/[^a-zA-Z0-9]/g, '');

        searchTitle.textContent = `Search options for "${query}":`;
        resultsGrid.innerHTML = '';

        // Define platform routes
        const platforms = [
            {
                name: 'YouTube',
                tag: 'Videos & Shorts',
                color: '#FF0000',
                description: 'Search full edits, compilations, and high-quality YouTube Shorts.',
                url: `https://www.youtube.com/results?search_query=${encodedQuery}`,
                actionText: 'Search YouTube ↗'
            },
            {
                name: 'TikTok',
                tag: 'Trends & Sounds',
                color: '#00F2FE',
                description: 'Discover viral video clips, audio mashups, and trending edits.',
                url: `https://www.tiktok.com/search?q=${encodedQuery}`,
                actionText: 'Search TikTok ↗'
            },
            {
                name: 'Instagram Reels',
                tag: 'Reels & Hashtags',
                color: '#E1306C',
                description: 'Explore Instagram Reels and audio pages tagged with this theme.',
                url: `https://www.instagram.com/explore/tags/${cleanHashtag}/`,
                actionText: 'Search Reels ↗'
            }
        ];

        // Render clean, interactive platform menu cards
        platforms.forEach(p => {
            const card = document.createElement('div');
            card.className = 'menu-card';
            card.innerHTML = `
                <div class="card-header">
                    <span class="platform-badge" style="background-color: ${p.color};">${p.name}</span>
                    <span class="platform-tag">${p.tag}</span>
                </div>
                <p class="card-desc">${p.description}</p>
                <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="platform-btn">
                    ${p.actionText}
                </a>
            `;
            resultsGrid.appendChild(card);
        });
    }

    function resetMenu() {
        searchTitle.textContent = 'Select a Platform to Search';
        resultsGrid.innerHTML = `
            <div class="placeholder-msg">
                <p>Type a phrase above and click Explore to generate search routes.</p>
            </div>
        `;
    }
});
