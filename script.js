document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultsGrid = document.getElementById('resultsGrid');
    const searchTitle = document.getElementById('searchTitle');

    searchInput.addEventListener('input', () => {
        clearBtn.classList.toggle('visible', searchInput.value.trim().length > 0);
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.remove('visible');
        searchInput.focus();
        resetMenu();
    });

    searchBtn.addEventListener('click', generatePlatformMenu);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') generatePlatformMenu();
    });

    // Smart query generator: transforms raw prompts into intent-driven queries
    function buildSmartQueries(rawInput) {
        const query = rawInput.trim();
        const terms = query.split(/\s+/);

        // If the user entered multiple words (e.g., "paul george sza")
        if (terms.length >= 2) {
            return {
                // YouTube: force intent towards edits/audio mashups
                youtube: `${query} edit OR audio OR song`,
                // TikTok: format for creator/audio crossover trends
                tiktok: `${query} edit audio`,
                // Instagram: combined hashtag for niche edit communities
                instagramHashtag: query.replace(/[^a-zA-Z0-9]/g, '') + 'edit'
            };
        }

        return {
            youtube: `${query} edit`,
            tiktok: `${query} edit`,
            instagramHashtag: query.replace(/[^a-zA-Z0-9]/g, '')
        };
    }

    function generatePlatformMenu() {
        const rawInput = searchInput.value.trim();
        if (!rawInput) return;

        const smart = buildSmartQueries(rawInput);

        searchTitle.textContent = `Smart routes for "${rawInput}":`;
        resultsGrid.innerHTML = '';

        const platforms = [
            {
                name: 'YouTube',
                tag: 'Edits & Audio Syncs',
                color: '#FF0000',
                description: `Find videos & edits featuring ${rawInput} synced with song/audio tracks.`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(smart.youtube)}`,
                actionText: 'Search YouTube ↗'
            },
            {
                name: 'TikTok',
                tag: 'Viral Audio & Clips',
                color: '#00F2FE',
                description: `Search TikTok for trends combining ${rawInput} with background music.`,
                url: `https://www.tiktok.com/search?q=${encodeURIComponent(smart.tiktok)}`,
                actionText: 'Search TikTok ↗'
            },
            {
                name: 'Instagram Reels',
                tag: 'Reels & Community Edits',
                color: '#E1306C',
                description: `Explore Instagram edit tags and reels for #${smart.instagramHashtag}.`,
                url: `https://www.instagram.com/explore/tags/${encodeURIComponent(smart.instagramHashtag)}/`,
                actionText: 'Search Reels ↗'
            }
        ];

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
