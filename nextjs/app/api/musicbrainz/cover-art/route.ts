import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const releaseGroupId = searchParams.get("releaseGroupId");

    if (!releaseGroupId) {
        return NextResponse.json({ error: "Release Group ID is required" }, { status: 400 });
    }

    try {
        // First, get releases from the release group
        const releaseUrl = `https://musicbrainz.org/ws/2/release?release-group=${releaseGroupId}&fmt=json&limit=1`;
        const releaseResponse = await fetch(releaseUrl, {
            headers: {
                'User-Agent': 'cbrossar/1.0 (cole.brossart@gmail.com)'
            }
        });

        if (!releaseResponse.ok) {
            return NextResponse.json({ 
                coverArtUrl: null,
                found: false 
            });
        }

        const releaseData = await releaseResponse.json();
        const releases = releaseData.releases || [];
        
        if (releases.length === 0) {
            return NextResponse.json({ 
                coverArtUrl: null,
                found: false 
            });
        }

        const releaseId = releases[0].id;

        // Now try to get cover art using the release ID
        const caaUrl = `https://coverartarchive.org/release/${releaseId}`;
        const response = await fetch(caaUrl, {
            headers: {
                'User-Agent': 'cbrossar/1.0 (cole.brossart@gmail.com)'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const images = data.images || [];

            // Look for front cover
            for (const image of images) {
                if (image.front) {
                    return NextResponse.json({ 
                        coverArtUrl: image.image,
                        found: true 
                    });
                }
            }

            // If no front cover, return the first available image
            if (images.length > 0) {
                return NextResponse.json({ 
                    coverArtUrl: images[0].image,
                    found: true 
                });
            }
        }

        // Fallback: try direct front cover URL
        const frontUrl = `https://coverartarchive.org/release/${releaseId}/front`;
        const frontResponse = await fetch(frontUrl, { method: 'HEAD' });

        if (frontResponse.ok) {
            return NextResponse.json({ 
                coverArtUrl: frontUrl,
                found: true 
            });
        }

        return NextResponse.json({ 
            coverArtUrl: null,
            found: false 
        });

    } catch (error) {
        console.error("Error fetching cover art:", error);
        return NextResponse.json({ 
            error: "Failed to fetch cover art",
            coverArtUrl: null,
            found: false 
        }, { status: 500 });
    }
}
