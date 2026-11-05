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

    const mediaDictionary = {
        'phonk': { context: 'drift phonk bass boost mix audio' },
        'slowed': { context: 'slowed and reverb audio remix' },
        'drill': { context: 'uk drill ny drill beat drop edit' },
        'rage': { context: 'rage beat synth loop underground rap' },
        'bp': { context: 'Blackpink trend audio remix beat drop' },
        'dave': { context: 'Dave rap vocal sync audio track' },
        'sza': { context: 'SZA soulful vocal track snooze kill bill' },
        'speed': { context: 'IShowSpeed screaming meme edit audio' },
        'kai': { context: 'Kai Cenat stream funny moments edit' },
        'fn': { context: 'Fortnite montage cinematic edit audio' },
        'val': { context: 'Valorant clips montage phonk edit' }
    };

    /**
     * Universal Intent Compiler:
     * Builds native search strings for YouTube, TikTok, and Instagram Keyword Search.
     */
    function compileIntent(rawInput) {
        const clean = rawInput.trim().toLowerCase();
        const words = clean.split(/\s+/).filter(w => w.length > 0);

        if (words.length === 0) return null;

        const lastWord = words[words.length - 1];
        const subject = words.slice(0, -1).join(' ');

        let resolvedContext = lastWord;

        if (mediaDictionary[lastWord]) {
            resolvedContext = mediaDictionary[lastWord].context;
        } else if (words.length >= 2) {
            resolvedContext = `${lastWord} edit remix audio`;
        } else {
            resolvedContext = `${lastWord} edit trend audio`;
        }

        let youtubeQuery = '';
        let tiktokQuery = '';
        let instagramQuery = '';

        if (subject) {
            youtubeQuery = `"${subject}" ("${resolvedContext}" OR "${lastWord}") edit`;
            tiktokQuery = `${subject} ${lastWord} edit audio`;
            // Instagram Keyword Search across captions, audio & transcriptions
            instagramQuery = `${subject} ${lastWord} edit`;
        } else {
            youtubeQuery = `"${lastWord}" edit remix audio`;
            tiktokQuery = `${lastWord} edit trend audio`;
            instagramQuery = `${lastWord} edit`;
        }

        return {
            displayTerm: rawInput,
            youtube: youtubeQuery,
            tiktok: tiktokQuery,
            instagram: instagramQuery
        };
    }

    function generatePlatformMenu() {
        const rawInput = searchInput.value.trim();
        if (!rawInput) return;

        const intent = compileIntent(rawInput);
        if (!intent) return;

        searchTitle.textContent = `Trending Routes for "${rawInput}":`;
        resultsGrid.innerHTML = '';

        const platforms = [
            {
                name: 'YouTube',
                tag: 'Audio-Matched Query',
                color: '#FF0000',
                description: `Compiled Query: ${intent.youtube}`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(intent.youtube)}`,
                actionText: 'Search YouTube ↗'
            },
            {
                name: 'TikTok',
                tag: 'Viral Sound Sync',
                color: '#00F2FE',
                description: `Compiled Query: ${intent.tiktok}`,
                url: `https://www.tiktok.com/search?q=${encodeURIComponent(intent.tiktok)}`,
                actionText: 'Search TikTok ↗'
            },
            {
                name: 'Instagram Reels',
                tag: 'Universal Reels Index',
                color: '#E1306C',
                description: `Compiled Keyword Query: "${intent.instagram}"`,
                url: `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(intent.instagram)}`,
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
                <p class="card-desc"><strong>${p.description}</strong></p>
                <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="platform-btn">
                    ${p.actionText}
                </a>
            `;
            resultsGrid.appendChild(card);
        });
    }

    function resetMenu() {
        searchTitle.textContent = 'Select a Platform Route';
        resultsGrid.innerHTML = `
            <div class="placeholder-msg">
                <p>Enter any trendy subject, streamer, meme, or song combo above to compile live routes.</p>
            </div>
        `;
    }
});
