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
     * Intent Compiler: Parses multi-subject queries (e.g. "paul george sza")
     * into target search strings tailored to each platform's indexing rules.
     */
    function compileIntent(rawInput) {
        const clean = rawInput.trim().toLowerCase();
        const words = clean.split(/\s+/).filter(w => w.length > 0);

        if (words.length === 0) return null;

        let youtubeQuery = '';
        let tiktokQuery = '';
        let instagramHashtags = [];

        if (words.length >= 2) {
            // Split into primary subject (first terms) and secondary/audio context (last term)
            const audioContext = words[words.length - 1];
            const subject = words.slice(0, words.length - 1).join(' ');

            // YouTube: Force exact subject match + Boolean audio/edit context
            youtubeQuery = `"${subject}" ("${audioContext}" OR "audio" OR "song") (edit OR mix OR audio)`;
            
            // TikTok: Target sound edits and video crossover trends
            tiktokQuery = `${subject} edit sound ${audioContext} audio`;

            // Instagram: Clean hashtag mashups
            const cleanSubject = subject.replace(/[^a-z0-9]/g, '');
            const cleanAudio = audioContext.replace(/[^a-z0-9]/g, '');
            
            instagramHashtags = [
                `${cleanSubject}edit`,
                `${cleanSubject}x${cleanAudio}`,
                `${cleanSubject}`
            ];
        } else {
            // Single word prompt (e.g. "kyrie")
            const word = words[0];
            youtubeQuery = `"${word}" (edit OR audio OR highlights OR mix)`;
            tiktokQuery = `${word} edit audio sound`;
            instagramHashtags = [`${word}edit`, `${word}`];
        }

        return {
            youtube: youtubeQuery,
            tiktok: tiktokQuery,
            instagramTag: instagramHashtags[0]
        };
    }

    function generatePlatformMenu() {
        const rawInput = searchInput.value.trim();
        if (!rawInput) return;

        const intent = compileIntent(rawInput);
        if (!intent) return;

        searchTitle.textContent = `Compiled matches for "${rawInput}":`;
        resultsGrid.innerHTML = '';

        const platforms = [
            {
                name: 'YouTube',
                tag: 'Boolean Audio Sync Query',
                color: '#FF0000',
                description: `Compiled Query: ${intent.youtube}`,
                url: `https://www.youtube.com/results?search_query=${encodeURIComponent(intent.youtube)}`,
                actionText: 'Search YouTube ↗'
            },
            {
                name: 'TikTok',
                tag: 'Audio & Sound Matching',
                color: '#00F2FE',
                description: `Compiled Query: "${intent.tiktok}"`,
                url: `https://www.tiktok.com/search?q=${encodeURIComponent(intent.tiktok)}`,
                actionText: 'Search TikTok ↗'
            },
            {
                name: 'Instagram Reels',
                tag: 'Reels Tag Route',
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
                <p>Enter your subject and song/artist combo above to compile optimized search queries.</p>
            </div>
        `;
    }
});
