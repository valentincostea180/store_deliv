interface Coordinates {
  lat: number;
  lng: number;
  success: boolean;
  error?: string;
  note?: string;
}

async function unshortenUrl(shortUrl: string): Promise<string> {
  try {
    const response = await fetch(
      `https://unshorten.me/json/${encodeURIComponent(shortUrl)}`,
    );

    if (!response.ok) {
      throw new Error("Failed to unshorten URL");
    }

    const data = await response.json();

    if (data.success && data.resolved_url) {
      return data.resolved_url;
    }

    throw new Error("Could not resolve URL");
  } catch (error) {
    console.error("Error unshortening URL:", error);
    throw error;
  }
}

export async function extractCoordinatesFromGoogleMapsUrl(
  url: string,
): Promise<Coordinates> {
  try {
    let cleanUrl = url.trim();

    if (
      cleanUrl.includes("goo.gl") ||
      cleanUrl.includes("bit.ly") ||
      cleanUrl.includes("tinyurl.com") ||
      cleanUrl.includes("maps.app.goo.gl")
    ) {
      try {
        const resolvedUrl = await unshortenUrl(cleanUrl);
        cleanUrl = resolvedUrl;
      } catch (error) {
        return {
          lat: 0,
          lng: 0,
          success: false,
          error: `Failed to unshorten URL: ${error}`,
        };
      }
    }

    // Pattern 1: @lat,lng
    const atPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const atMatch = cleanUrl.match(atPattern);
    if (atMatch) {
      return {
        lat: parseFloat(atMatch[1]),
        lng: parseFloat(atMatch[2]),
        success: true,
      };
    }

    // Pattern 2: /place/lat,lng
    const placePattern = /place\/(-?\d+\.\d+),(-?\d+\.\d+)/;
    const placeMatch = cleanUrl.match(placePattern);
    if (placeMatch) {
      return {
        lat: parseFloat(placeMatch[1]),
        lng: parseFloat(placeMatch[2]),
        success: true,
      };
    }

    // Pattern 3: query parameter ?query=lat,lng
    const queryPattern = /[?&]query=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const queryMatch = cleanUrl.match(queryPattern);
    if (queryMatch) {
      return {
        lat: parseFloat(queryMatch[1]),
        lng: parseFloat(queryMatch[2]),
        success: true,
      };
    }

    // Pattern 4: data parameter ?data=...!3d...!4d...
    const dataPattern = /[?&]data=.*!3d(-?\d+\.\d+).*!4d(-?\d+\.\d+)/;
    const dataMatch = cleanUrl.match(dataPattern);
    if (dataMatch) {
      return {
        lat: parseFloat(dataMatch[1]),
        lng: parseFloat(dataMatch[2]),
        success: true,
      };
    }

    // Pattern 5: Embedded coordinates in path
    const embeddedPattern = /\/(-?\d+\.\d+),(-?\d+\.\d+)/;
    const embeddedMatch = cleanUrl.match(embeddedPattern);
    if (embeddedMatch && cleanUrl.includes("google.com/maps")) {
      return {
        lat: parseFloat(embeddedMatch[1]),
        lng: parseFloat(embeddedMatch[2]),
        success: true,
      };
    }
    return {
      lat: 0,
      lng: 0,
      success: false,
      error: "No coordinates found in URL",
    };
  } catch (error) {
    return {
      lat: 0,
      lng: 0,
      success: false,
      error: `Error parsing URL: ${error}`,
    };
  }
}
