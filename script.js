document.addEventListener('DOMContentLoaded', () => {
    // Element Selectors
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    const feedbackContent = document.getElementById('feedbackContent');
    
    const btnYoutube = document.getElementById('searchYoutube');
    const btnTiktok = document.getElementById('searchTiktok');
    const btnInstagram = document.getElementById('searchInstagram');

    // Input Clear Button Visibility Toggle
    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim().length > 0) {
            clearBtn.classList.add('visible');
        } else {
            clearBtn.classList.remove('visible');
        }
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.remove('visible');
        searchInput.focus();
        showPlaceholder();
    });

    // Enter Key Handler (Defaults to YouTube)
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            dispatchSearch('youtube');
        }
    });

    // Platform Button Event Listeners
    btnYoutube.addEventListener('click', () => dispatchSearch('youtube'));
    btnTiktok.addEventListener('click', () => dispatchSearch('tiktok'));
    btnInstagram.addEventListener('click', () => dispatchSearch('instagram'));

    /**
     * Search Dispatch Router
     * @param {string} platform - 'youtube' | 'tiktok' | 'instagram'
     */
    function dispatchSearch(platform) {
        const rawQuery = searchInput.value.trim();

        if (!rawQuery) {
            renderMessage('Please enter a search phrase first (e.g., "Kyrie Irving Dave edit").', 'error');
            searchInput.focus();
            return;
        }

        const encodedQuery = encodeURIComponent(rawQuery);

        switch (platform) {
            case 'youtube': {
                const targetUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;
                window.open(targetUrl, '_blank', 'noopener,noreferrer');
                renderMessage(`Routing search for "<strong>${escapeHtml(rawQuery)}</strong>" to YouTube...`, 'success');
                break;
            }

            case 'tiktok': {
                const targetUrl = `https://www.tiktok.com/search?q=${encodedQuery}`;
                window.open(targetUrl, '_blank', 'noopener,noreferrer');
                renderMessage(`Routing search for "<strong>${escapeHtml(rawQuery)}</strong>" to TikTok...`, 'success');
                break;
            }

            case 'instagram': {
                // Instagram limits direct web search URLs for general terms.
                const fallbackUrl = `https://www.instagram.com/`;
                renderInstagramLimitation(rawQuery, fallbackUrl);
                break;
            }

            default:
                renderMessage('Selected platform is not supported.', 'error');
        }
    }

    /**
     * Specialized Handler for Instagram Limitations
     */
    function renderInstagramLimitation(query, fallbackUrl) {
        feedbackContent.innerHTML = `
            <div class="status-message">
                <p><strong>Instagram Search Notice:</strong> Instagram web requires users to be logged in to execute specific term searches directly.</p>
                <div class="status-actions">
                    <button type="button" id="copyPhraseBtn" class="secondary-btn">Copy Search Phrase</button>
                    <a href="${fallbackUrl}" target="_blank" rel="noopener noreferrer" class="secondary-btn">Open Instagram Web ↗</a>
                </div>
            </div>
        `;

        const copyBtn = document.getElementById('copyPhraseBtn');
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(query);
                copyBtn.textContent = 'Copied to Clipboard! ✓';
            } catch (err) {
                copyBtn.textContent = 'Failed to copy';
            }
        });
    }

    function renderMessage(htmlText, type) {
        feedbackContent.innerHTML = `<p class="status-message ${type}">${htmlText}</p>`;
    }

    function showPlaceholder() {
        feedbackContent.innerHTML = `<p class="placeholder-text">Type a phrase above and choose a platform to launch your search.</p>`;
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});