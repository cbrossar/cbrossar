const client_id = process.env.SPOTIFY_CLIENT_ID as string;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET as string;

const getAccessToken = async (): Promise<string> => {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
                "Basic " +
                Buffer.from(client_id + ":" + client_secret).toString("base64"),
        },
        body: new URLSearchParams({
            grant_type: "client_credentials",
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch access token");
    }

    const data = await response.json();
    return data.access_token;
};

interface Album {
    id: string;
    name: string;
    artists: { name: string }[];
}

const searchAlbum = async (query: string): Promise<Album[]> => {
    const token = await getAccessToken();
    const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album`,
        {
            headers: {
                Authorization: "Bearer " + token,
            },
        },
    );

    if (!response.ok) {
        throw new Error("Failed to search for albums");
    }

    const data = await response.json();
    return data.albums.items;
};

export { searchAlbum };
