import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type Waypoint = {
  lat: number;
  lng: number;
};

function isValidWaypoint(value: unknown): value is Waypoint {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { lat?: unknown; lng?: unknown };
  return (
    typeof candidate.lat === "number" &&
    typeof candidate.lng === "number" &&
    candidate.lat >= -90 &&
    candidate.lat <= 90 &&
    candidate.lng >= -180 &&
    candidate.lng <= 180
  );
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      tripId?: unknown;
      waypoints?: unknown;
    };

    const tripId = typeof body.tripId === "string" ? body.tripId : "";
    const waypoints = Array.isArray(body.waypoints)
      ? body.waypoints.filter(isValidWaypoint)
      : [];

    if (!tripId) {
      return NextResponse.json({ error: "tripId is required." }, { status: 400 });
    }
    if (waypoints.length < 2) {
      return NextResponse.json({ error: "At least 2 waypoints are required." }, { status: 400 });
    }

    const membership = await prisma.tripParticipant.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId: user.id,
        },
      },
      select: { isActive: true },
    });
    if (!membership?.isActive) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const apiKey = process.env.GOOGLE_LOCATION_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_LOCATION_API_KEY is not configured." },
        { status: 500 },
      );
    }

    const routeResponse = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: waypoints[0].lat,
              longitude: waypoints[0].lng,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: waypoints[waypoints.length - 1].lat,
              longitude: waypoints[waypoints.length - 1].lng,
            },
          },
        },
        intermediates: waypoints.slice(1, -1).map((point) => ({
          location: {
            latLng: {
              latitude: point.lat,
              longitude: point.lng,
            },
          },
        })),
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
      }),
    });

    if (!routeResponse.ok) {
      const errorBody = await routeResponse.text();
      return NextResponse.json(
        { error: `Routes API request failed: ${errorBody || routeResponse.statusText}` },
        { status: 502 },
      );
    }

    const payload = (await routeResponse.json()) as {
      routes?: Array<{
        distanceMeters?: number;
        duration?: string;
        polyline?: { encodedPolyline?: string };
      }>;
    };

    const route = payload.routes?.[0];
    if (!route?.polyline?.encodedPolyline) {
      return NextResponse.json({ error: "No route returned from Routes API." }, { status: 422 });
    }

    const durationSeconds = route.duration
      ? Number.parseInt(route.duration.replace("s", ""), 10) || 0
      : 0;

    return NextResponse.json({
      encodedPolyline: route.polyline.encodedPolyline,
      totalDistanceMeters: route.distanceMeters ?? 0,
      totalDurationSeconds: durationSeconds,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected error while computing route.",
      },
      { status: 500 },
    );
  }
}
