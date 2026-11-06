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

    // Words that explicitly indicate the user wants an edit/mashup
    const editKeywords = ['edit', 'edits', 'audio', 'song', 'remix', 'mashup', 'phonk', 'slowed', 'reverb', 'montage'];

    // Strict dictionary of confirmed shorthand trend codes
    const mediaDictionary = {
        'phonk': 'drift phonk bass boost mix',
        'slowed': 'slowed and reverb audio',
        'drill': 'uk drill ny drill beat drop',
        'rage': 'rage beat synth loop',
        'bp': 'Blackpink audio remix beat drop',
        'dave': 'Dave rap vocal sync track',
        'sza': 'SZA vocal track snooze kill bill'
    };

    /**
     * Intent Classifier & Router Engine
     */
    function compileIntent(rawInput) {
        const clean = rawInput.trim().toLowerCase();
        // Keep alphanumeric spaces only for security/URL sanitization
        const sanitized = clean.replace(/[^a-z0-9\s]/g, '');
        const words = sanitized.split(/\s+/).filter(w => w.length > 0);

        if (words.length === 0) return null;

        const containsEditKeyword = words.some(w => editKeywords.includes(w));
        const lastWord = words[words.length - 1];
        const isKnownShorthand = mediaDictionary[lastWord] !== undefined;

        let youtubeQuery = '';
        let tiktokQuery = '';
        let instagramQuery = '';

        if (containsEditKeyword) {
            // Case 1: User explicitly asked for edits/audio/remixes
            youtubeQuery = rawInput;
            tiktokQuery = sanitized;
            instagramQuery = sanitized;
        } else if (isKnownShorthand && words.length >= 2) {
            // Case 2: Multi-subject prompt ending in a KNOWN trend shorthand (e.g., "kyrie irving dave", "paul george sza")
            const subject = words.slice(0, -1).join(' ');
            const audioContext = mediaDictionary[lastWord];

            youtubeQuery = `${subject}${lastWord} edit`;
            tiktokQuery = `${subject}${lastWord} edit audio`;
            instagramQuery = `${subject}${lastWord} edit`;
        } else {
            // Case 3: Standard queries (e.g., "wolfy playz gw2", "alfred", "kai cenat")
            // Pass the exact query naturally without forcing quotes, edits, or extra operators!
            youtubeQuery = rawInput;
            tiktokQuery = sanitized;
            instagramQuery = sanitized;
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

        searchTitle.textContent = `Compiled Routes for "${rawInput}":`;
        resultsGrid.innerHTML = '';

        const platforms = [
            {
                name: 'YouTube',
                tag: 'Targeted Search Query',
                color: '#FF0000',
                description: `Compiled Query: ${intent.youtube}`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(intent.youtube)}`,
                actionText: 'Search YouTube ↗'
            },
            {
                name: 'TikTok',
                tag: 'Native Platform Search',
                color: '#00F2FE',
                description: `Compiled Query: "${intent.tiktok}"`, url: `https://www.tiktok.com/search?q=${encodeURIComponent(intent.tiktok)}`,
                actionText: 'Search TikTok ↗'
            },
            {
                name: 'Instagram Reels',
                tag: 'Universal Keyword Index',
                color: '#E1306C',
                description: `Compiled Keyword Query: "${intent.instagram}"`, url: `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(intent.instagram)}`,
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
                <a href="${p.url}"
