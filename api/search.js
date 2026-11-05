export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Search query parameter (q) is required.' });
    }

    const API_KEY = process.env.YOUTUBE_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: 'YouTube API key is missing on the server environment.' });
    }

    try {
        const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(q)}&type=video&key=${API_KEY}`;
        
        const response = await fetch(youtubeUrl);
        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        const results = data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium.url,
            platform: 'youtube',
            webUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
        }));

        return res.status(200).json({ results });

    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch results from YouTube API.' });
    }
}
