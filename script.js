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

    /**
     * Universal Trend & Media Dictionary:
     * Covers modern music styles, streaming/gaming memes, and edit subcultures.
     */
    const mediaDictionary = {
        // Music & Audio Styles
        'phonk': { context: 'drift phonk bass boost mix audio', tag: 'phonkedit' },
        'slowed': { context: 'slowed and reverb audio remix', tag: 'slowedreverb' },
        'drill': { context: 'uk drill ny drill beat drop edit', tag: 'drilledit' },
        'rage': { context: 'rage beat synth loop underground rap', tag: 'rageedit' },
        
        // Trending Shorthands & Catalogs
        'bp': { context: 'Blackpink trend audio remix beat drop', tag: 'bpedit' },
        'dave': { context: 'Dave rap vocal sync audio track', tag: 'daveedit' },
        'sza': { context: 'SZA soulful vocal track snooze kill bill', tag: 'szaedit' },
        
        // Streamer & Gaming Culture
        'speed': { context: 'IShowSpeed screaming meme edit audio', tag: 'speededit' },
        'kai': { context: 'Kai Cenat stream funny moments edit', tag: 'kaicenatedit' },
        'fn': { context: 'Fortnite montage cinematic edit audio', tag: 'fortniteedit' },
        'val': { context: 'Valorant clips montage phonk edit', tag: 'valorantedit' }
    };

    /**
     * Universal Intent Compiler:
     * Automatically expands any trendy prompt into platform-optimized search queries.
     */
    function compileIntent(rawInput) {
        const clean = rawInput.trim().toLowerCase();
        const words = clean.split(/\s+/).filter(w => w.length > 0);

        if (words.length === 0) return null;

        const lastWord = words[words.length - 1];
        const subject = words.slice(0, -1).join(' ');

        let resolvedContext = lastWord;
        let instagramSuffix = lastWord;

        // Check if the trailing term matches our media/trend dictionary
        if (mediaDictionary[lastWord]) {
            resolvedContext = mediaDictionary[lastWord].context;
            instagramSuffix = mediaDictionary[lastWord].tag;
        } else if (words.length >= 2) {
            // Universal fallback for new/unknown trends: treat last word as a style/audio modifier
            resolvedContext = `${lastWord} edit remix audio`;
            instagramSuffix = `${lastWord}edit`;
        } else {
            resolvedContext = `${lastWord} edit trend audio`;
            instagramSuffix = `${lastWord}edit`;
        }

        let youtubeQuery = '';
        let tiktokQuery = '';
        let instagramTag = '';

        if (subject) {
            youtubeQuery = `"${subject}" ("${resolvedContext}" OR "${lastWord}") edit`;
            tiktokQuery = `${subject} ${lastWord} edit audio`;
            instagramTag = `${subject.replace(/[^a-z0-9]/g, '')}${instagramSuffix}`;
        } else {
            youtubeQuery = `"${lastWord}" edit remix audio`;
            tiktokQuery = `${lastWord} edit trend audio`;
            instagramTag = instagramSuffix;
        }

        return {
            displayTerm: rawInput,
            youtube: youtubeQuery,
            tiktok: tiktokQuery,
            instagramTag: instagramTag.replace(/[^a-z0-9]/g, '')
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
                tag: 'Reels Edit Route',
                color: '#E1306C',
                description: `Compiled Tag Route: #${intent.instagramTag}`,
                url: `https://www.instagram.com/explore/tags/${encodeURIComponent(intent.instagramTag)}/`,
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
