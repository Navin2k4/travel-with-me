"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, LocateFixed, MapPin } from "lucide-react";
import {
  createPlannedPlaceAction,
  removePlannedPlaceAction,
  reorderPlannedPlacesAction,
} from "@/lib/actions/planner";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google?: any;
  }
}

type PlannerPlace = {
  id: string;
  googlePlaceId: string;
  name: string;
  formattedAddress: string | null;
  latitude: number;
  longitude: number;
  mapUrl: string | null;
  position: number;
};

type SelectedGooglePlace = {
  googlePlaceId: string;
  name: string;
  formattedAddress?: string;
  latitude: number;
  longitude: number;
  mapUrl?: string;
};

type PlaceSuggestion = {
  placeId: string;
  primaryText: string;
  secondaryText: string;
};

type LocationPlannerTabProps = {
  tripId: string;
  googleMapsApiKey: string;
  initialPlaces: PlannerPlace[];
};

function decodeGooglePolyline(encoded: string) {
  let index = 0;
  const coordinates: Array<{ lat: number; lng: number }> = [];
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    latitude += deltaLat;

    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    longitude += deltaLng;

    coordinates.push({ lat: latitude / 1e5, lng: longitude / 1e5 });
  }

  return coordinates;
}

function formatDistance(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function toMapCenter(place: PlannerPlace) {
  return { lat: place.latitude, lng: place.longitude };
}

export function LocationPlannerTab({
  tripId,
  googleMapsApiKey,
  initialPlaces,
}: LocationPlannerTabProps) {
  const [places, setPlaces] = useState<PlannerPlace[]>(
    [...initialPlaces].sort((a, b) => a.position - b.position),
  );
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<SelectedGooglePlace | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<"loading" | "ready" | "error">("loading");
  const [googleStatusText, setGoogleStatusText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [routeSummary, setRouteSummary] = useState<{
    totalDistanceMeters: number;
    totalDurationSeconds: number;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSearching, setIsSearching] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const manualMarkersRef = useRef<any[]>([]);
  const pickedLocationMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const routeRequestVersionRef = useRef(0);
  const mapPickRequestVersionRef = useRef(0);

  const hasApiKey = googleMapsApiKey.trim().length > 0;

  const initializeGoogleLibraries = useCallback(async () => {
    if (!window.google?.maps) return false;

    if (typeof window.google.maps.importLibrary === "function") {
      try {
        const mapsLib = (await window.google.maps.importLibrary("maps")) as { Map?: unknown };
        const placesLib = (await window.google.maps.importLibrary("places")) as {
          AutocompleteService?: unknown;
          PlacesService?: unknown;
        };

        const hasMapCtor =
          typeof mapsLib.Map === "function" || typeof window.google.maps.Map === "function";
        const hasPlacesCtors =
          typeof placesLib.AutocompleteService === "function" ||
          typeof window.google.maps.places?.AutocompleteService === "function";
        const hasPlacesServiceCtor =
          typeof placesLib.PlacesService === "function" ||
          typeof window.google.maps.places?.PlacesService === "function";

        return hasMapCtor && hasPlacesCtors && hasPlacesServiceCtor;
      } catch {
        return false;
      }
    }

    const hasMapCtor = typeof window.google.maps.Map === "function";
    const hasPlaces =
      typeof window.google.maps.places?.AutocompleteService === "function" &&
      typeof window.google.maps.places?.PlacesService === "function";

    return hasMapCtor && hasPlaces;
  }, []);

  const waitForGoogleLibraries = useCallback(async () => {
    const maxAttempts = 20;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const ok = await initializeGoogleLibraries();
      if (ok) return true;
      await new Promise((resolve) => window.setTimeout(resolve, 250));
    }
    return false;
  }, [initializeGoogleLibraries]);

  useEffect(() => {
    if (!hasApiKey) {
      setGoogleReady(false);
      setGoogleStatus("error");
      setGoogleStatusText("Google Maps API key is missing. Set GOOGLE_LOCATION_API_KEY.");
      return;
    }

    const finalizeLoad = async () => {
      setGoogleStatus("loading");
      setGoogleStatusText("Loading Google Maps...");
      const ok = await waitForGoogleLibraries();
      if (ok) {
        setGoogleReady(true);
        setGoogleStatus("ready");
        setGoogleStatusText(null);
      } else {
        setGoogleReady(false);
        setGoogleStatus("error");
        setGoogleStatusText(
          "Google Maps libraries are taking longer than expected. Try refreshing the page.",
        );
      }
    };

    if (window.google?.maps) {
      void finalizeLoad();
      return;
    }

    const existingScript = document.getElementById("google-maps-sdk");
    if (existingScript) {
      existingScript.addEventListener("load", () => void finalizeLoad(), { once: true });
      existingScript.addEventListener(
        "error",
        () => setErrorText("Could not load Google Maps SDK."),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-sdk";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleMapsApiKey)}&libraries=places,routes&v=weekly&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => void finalizeLoad();
    script.onerror = () => {
      setGoogleReady(false);
      setGoogleStatus("error");
      setGoogleStatusText("Could not load Google Maps SDK.");
    };
    document.head.appendChild(script);
  }, [googleMapsApiKey, hasApiKey, waitForGoogleLibraries]);

  useEffect(() => {
    if (!googleReady || !window.google?.maps?.places) return;
    geocoderRef.current = new window.google.maps.Geocoder();
    autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    placesServiceRef.current = new window.google.maps.places.PlacesService(
      document.createElement("div"),
    );
  }, [googleReady]);

  useEffect(() => {
    if (!googleReady || !mapContainerRef.current || mapRef.current) return;
    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 4,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
    mapRef.current = map;
  }, [googleReady]);

  const selectMapPoint = useCallback(
    (lat: number, lng: number) => {
      if (!mapRef.current || !window.google?.maps) return;
      const requestVersion = ++mapPickRequestVersionRef.current;

      const point = { lat, lng };
      if (!pickedLocationMarkerRef.current) {
        pickedLocationMarkerRef.current = new window.google.maps.Marker({
          position: point,
          map: mapRef.current,
          title: "Selected location",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: "#0f766e",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
      } else {
        pickedLocationMarkerRef.current.setPosition(point);
      }

      const fallbackName = `Pinned (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
      const fallbackId = `latlng:${lat.toFixed(6)},${lng.toFixed(6)}`;
      const fallbackMapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

      const setFallbackSelection = () => {
        if (requestVersion !== mapPickRequestVersionRef.current) return;
        setSelectedPlace({
          googlePlaceId: fallbackId,
          name: fallbackName,
          formattedAddress: fallbackName,
          latitude: lat,
          longitude: lng,
          mapUrl: fallbackMapUrl,
        });
        setSearchText(fallbackName);
        setSuggestions([]);
        setErrorText(null);
      };

      const tryReverseGeocodeFallback = () => {
        if (!geocoderRef.current) {
          setFallbackSelection();
          return;
        }

        geocoderRef.current.geocode({ location: point }, (results: any[] | null, status: string) => {
          if (requestVersion !== mapPickRequestVersionRef.current) return;
          if (status !== "OK" || !results?.length) {
            setFallbackSelection();
            return;
          }

          const first = results[0];
          setSelectedPlace({
            googlePlaceId: first.place_id ?? fallbackId,
            name: first.address_components?.[0]?.long_name ?? first.formatted_address ?? fallbackName,
            formattedAddress: first.formatted_address ?? fallbackName,
            latitude: lat,
            longitude: lng,
            mapUrl: first.place_id
              ? `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(first.place_id)}`
              : fallbackMapUrl,
          });
          setSearchText(first.formatted_address ?? fallbackName);
          setSuggestions([]);
          setErrorText(null);
        });
      };

      if (!placesServiceRef.current) {
        tryReverseGeocodeFallback();
        return;
      }

      placesServiceRef.current.nearbySearch(
        {
          location: point,
          radius: 150,
        },
        (results: any[] | null, status: string) => {
          if (requestVersion !== mapPickRequestVersionRef.current) return;

          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !results?.length) {
            tryReverseGeocodeFallback();
            return;
          }

          const preferredTypes = new Set([
            "point_of_interest",
            "tourist_attraction",
            "establishment",
            "restaurant",
            "lodging",
            "museum",
            "park",
            "shopping_mall",
          ]);

          const nearestPlace =
            results.find((place) =>
              Array.isArray(place.types) &&
              place.types.some((type: string) => preferredTypes.has(type)),
            ) ?? results[0];

          const placeLat = nearestPlace.geometry?.location?.lat?.();
          const placeLng = nearestPlace.geometry?.location?.lng?.();
          if (
            !nearestPlace.place_id ||
            !nearestPlace.name ||
            typeof placeLat !== "number" ||
            typeof placeLng !== "number"
          ) {
            tryReverseGeocodeFallback();
            return;
          }

          setSelectedPlace({
            googlePlaceId: nearestPlace.place_id,
            name: nearestPlace.name,
            formattedAddress: nearestPlace.vicinity ?? nearestPlace.name,
            latitude: placeLat,
            longitude: placeLng,
            mapUrl: `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(nearestPlace.place_id)}`,
          });
          setSearchText(nearestPlace.name);
          setSuggestions([]);
          setErrorText(null);
        },
      );
    },
    [setErrorText, setSearchText, setSelectedPlace, setSuggestions],
  );

  useEffect(() => {
    if (!googleReady || !mapRef.current || !window.google?.maps?.event) return;

    const clickListener = mapRef.current.addListener("click", (event: any) => {
      const lat = event.latLng?.lat?.();
      const lng = event.latLng?.lng?.();
      if (typeof lat !== "number" || typeof lng !== "number") return;
      selectMapPoint(lat, lng);
    });

    return () => {
      window.google.maps.event.removeListener(clickListener);
    };
  }, [googleReady, selectMapPoint]);

  useEffect(() => {
    if (!googleReady || !autocompleteServiceRef.current) return;
    const trimmed = searchText.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);

    const timer = window.setTimeout(() => {
      autocompleteServiceRef.current.getPlacePredictions(
        { input: trimmed },
        (predictions: any[] | null, status: string) => {
          if (cancelled) return;
          setIsSearching(false);

          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
            setSuggestions([]);
            return;
          }

          setSuggestions(
            predictions.slice(0, 6).map((prediction) => ({
              placeId: prediction.place_id,
              primaryText: prediction.structured_formatting?.main_text ?? prediction.description,
              secondaryText:
                prediction.structured_formatting?.secondary_text ?? prediction.description,
            })),
          );
        },
      );
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [googleReady, searchText]);

  useEffect(() => {
    if (!googleReady || !mapRef.current) return;

    const clearManualMarkers = () => {
      manualMarkersRef.current.forEach((marker) => marker.setMap(null));
      manualMarkersRef.current = [];
    };

    const clearRoutePolyline = () => {
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
        routePolylineRef.current = null;
      }
    };

    clearManualMarkers();
    clearRoutePolyline();
    setRouteSummary(null);

    if (places.length === 0) {
      mapRef.current.setCenter({ lat: 20.5937, lng: 78.9629 });
      mapRef.current.setZoom(4);
      return;
    }

    if (places.length === 1) {
      const point = toMapCenter(places[0]);
      const marker = new window.google.maps.Marker({
        position: point,
        map: mapRef.current,
        title: places[0].name,
        label: "1",
      });
      manualMarkersRef.current = [marker];
      mapRef.current.setCenter(point);
      mapRef.current.setZoom(13);
      return;
    }

    const requestVersion = ++routeRequestVersionRef.current;
    const waypointPayload = places.map((place) => ({
      lat: place.latitude,
      lng: place.longitude,
    }));

    (async () => {
      try {
        const response = await fetch("/api/maps/compute-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tripId,
            waypoints: waypointPayload,
          }),
        });

        const data = (await response.json()) as {
          error?: string;
          encodedPolyline?: string;
          totalDistanceMeters?: number;
          totalDurationSeconds?: number;
        };
        if (requestVersion !== routeRequestVersionRef.current) return;

        if (!response.ok || !data.encodedPolyline) {
          setErrorText(data.error || "Could not calculate route for selected places.");
          return;
        }

        const decodedPath = decodeGooglePolyline(data.encodedPolyline);
        if (decodedPath.length === 0) {
          setErrorText("Could not render route path.");
          return;
        }

        routePolylineRef.current = new window.google.maps.Polyline({
          path: decodedPath,
          geodesic: true,
          strokeColor: "#0f766e",
          strokeOpacity: 0.95,
          strokeWeight: 5,
          map: mapRef.current,
        });

        manualMarkersRef.current = places.map((place, index) => {
          return new window.google.maps.Marker({
            position: toMapCenter(place),
            map: mapRef.current,
            title: place.name,
            label: String(index + 1),
          });
        });

        const bounds = new window.google.maps.LatLngBounds();
        decodedPath.forEach((point) => bounds.extend(point));
        mapRef.current.fitBounds(bounds);

        setRouteSummary({
          totalDistanceMeters: data.totalDistanceMeters ?? 0,
          totalDurationSeconds: data.totalDurationSeconds ?? 0,
        });
        setErrorText(null);
      } catch {
        if (requestVersion !== routeRequestVersionRef.current) return;
        setErrorText("Could not calculate route for selected places.");
      }
    })();
  }, [googleReady, places, tripId]);

  const orderedIds = useMemo(() => places.map((place) => place.id), [places]);

  const selectSuggestion = (suggestion: PlaceSuggestion) => {
    if (!placesServiceRef.current) return;

    placesServiceRef.current.getDetails(
      {
        placeId: suggestion.placeId,
        fields: ["place_id", "name", "formatted_address", "geometry", "url"],
      },
      (placeResult: any, status: string) => {
        if (status !== window.google.maps.places.PlacesServiceStatus.OK || !placeResult) {
          setErrorText("Failed to fetch selected place details.");
          return;
        }

        const latitude = placeResult.geometry?.location?.lat?.();
        const longitude = placeResult.geometry?.location?.lng?.();
        if (
          !placeResult.place_id ||
          !placeResult.name ||
          latitude === undefined ||
          longitude === undefined
        ) {
          setErrorText("Please choose a valid place from Google suggestions.");
          return;
        }

        setSelectedPlace({
          googlePlaceId: placeResult.place_id,
          name: placeResult.name,
          formattedAddress: placeResult.formatted_address,
          latitude,
          longitude,
          mapUrl: placeResult.url,
        });
        setSearchText(placeResult.name);
        setSuggestions([]);
        setErrorText(null);
      },
    );
  };

  const addSelectedPlace = () => {
    if (!selectedPlace) {
      setErrorText("Select a place from search suggestions first.");
      return;
    }

    if (places.some((place) => place.googlePlaceId === selectedPlace.googlePlaceId)) {
      setErrorText("This place is already in your planner.");
      return;
    }

    startTransition(async () => {
      const result = await createPlannedPlaceAction({
        tripId,
        googlePlaceId: selectedPlace.googlePlaceId,
        name: selectedPlace.name,
        formattedAddress: selectedPlace.formattedAddress,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        mapUrl: selectedPlace.mapUrl,
      });

      if (!result.ok) {
        setErrorText(typeof result.error === "string" ? result.error : "Failed to add place.");
        return;
      }

      setPlaces((current) => {
        if (current.some((place) => place.id === result.data.id)) return current;
        return [...current, result.data].sort((a, b) => a.position - b.position);
      });
      setSelectedPlace(null);
      setSearchText("");
      setSuggestions([]);
      setErrorText(null);
    });
  };

  const movePlace = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= places.length) return;

    const previous = [...places];
    const next = [...places];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    const normalized = next.map((place, normalizedIndex) => ({
      ...place,
      position: normalizedIndex,
    }));

    setPlaces(normalized);
    setErrorText(null);

    startTransition(async () => {
      const reorderResult = await reorderPlannedPlacesAction({
        tripId,
        orderedPlaceIds: normalized.map((place) => place.id),
      });

      if (!reorderResult.ok) {
        setPlaces(previous);
        setErrorText(
          typeof reorderResult.error === "string"
            ? reorderResult.error
            : "Failed to reorder places.",
        );
      }
    });
  };

  const removePlace = (plannedPlaceId: string) => {
    const previous = [...places];
    const next = previous
      .filter((place) => place.id !== plannedPlaceId)
      .map((place, index) => ({ ...place, position: index }));
    setPlaces(next);
    setErrorText(null);

    startTransition(async () => {
      const result = await removePlannedPlaceAction({
        tripId,
        plannedPlaceId,
      });
      if (!result.ok) {
        setPlaces(previous);
        setErrorText(typeof result.error === "string" ? result.error : "Failed to remove place.");
      }
    });
  };

  return (
    <section className="grid gap-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <h2 className="text-base font-semibold text-foreground">Location Planner</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Search places or click directly on the map, add stops in order, then adjust sequence to
          update route instantly.
        </p>
        {googleStatus !== "ready" ? (
          <div
            className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
              googleStatus === "loading"
                ? "border-border bg-muted/40 text-muted-foreground"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {googleStatusText ?? "Preparing Google Maps..."}
          </div>
        ) : null}

        <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <input
            placeholder="Search location in Google Maps..."
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
              setSelectedPlace(null);
            }}
            disabled={googleStatus !== "ready"}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
            />
            {suggestions.length > 0 ? (
              <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-border bg-popover p-1 shadow-md">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.placeId}
                    type="button"
                    className="w-full rounded-md px-2 py-2 text-left text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    <p className="font-medium">{suggestion.primaryText}</p>
                    <p className="text-xs text-muted-foreground">{suggestion.secondaryText}</p>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <Button type="button" onClick={addSelectedPlace} disabled={isPending || googleStatus !== "ready"}>
            Add Place
          </Button>
        </div>
        {isSearching ? (
          <p className="mt-2 text-xs text-muted-foreground">Searching Google places...</p>
        ) : null}

        {selectedPlace ? (
          <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm">
            <p className="font-medium text-foreground">{selectedPlace.name}</p>
            <p className="text-muted-foreground">
              {selectedPlace.formattedAddress ?? "No formatted address from Google"}
            </p>
          </div>
        ) : null}

        {errorText ? (
          <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorText}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Planned Stops</h3>
            <span className="text-xs text-muted-foreground">{orderedIds.length} place(s)</span>
          </div>

          <div className="grid gap-2">
            {places.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                No places added yet. Start by searching and adding your first stop.
              </p>
            ) : (
              places.map((place, index) => (
                <div
                  key={place.id}
                  className="grid gap-2 rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {index + 1}. {place.name}
                      </p>
                    </div>
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => movePlace(index, -1)}
                      disabled={isPending || index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => movePlace(index, 1)}
                      disabled={isPending || index === places.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="ml-auto"
                      onClick={() => removePlace(place.id)}
                      disabled={isPending}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl   p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <LocateFixed className="h-4 w-4 text-primary" />
            Live Route Map
          </div>
          <div className="relative">
            <div ref={mapContainerRef} className="h-[420px] w-full rounded-xl border border-border bg-muted/30" />
            {googleStatus !== "ready" ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-background/70 text-sm text-muted-foreground">
                {googleStatusText ?? "Loading map..."}
              </div>
            ) : null}
          </div>

          <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm">
            {routeSummary ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-border bg-card px-3 py-1 font-medium text-foreground">
                  Distance: {formatDistance(routeSummary.totalDistanceMeters)}
                </span>
                <span className="rounded-full border border-border bg-card px-3 py-1 font-medium text-foreground">
                  Duration: {formatDuration(routeSummary.totalDurationSeconds)}
                </span>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Add at least two places to calculate and display the driving route.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
