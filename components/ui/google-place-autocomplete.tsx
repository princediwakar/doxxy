// Path: components/ui/google-place-autocomplete.tsx
"use client";

import * as React from "react";
import { MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "use-debounce";
import { Spinner } from "@/components/ui/loading";
import type { GooglePlaceData, GooglePlaceSelection } from "@/types/google-places";

// ---------------------------------------------------------------------------
// Module-level Google Maps Places library loader (singleton)
// ---------------------------------------------------------------------------

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

let _placesLib: typeof google.maps.places | null = null;
let _loadPromise: Promise<typeof google.maps.places> | null = null;

async function getPlacesLib(): Promise<typeof google.maps.places> {
  if (_placesLib) return _placesLib;
  if (!_loadPromise) {
    const { setOptions, importLibrary } = await import("@googlemaps/js-api-loader");
    setOptions({ key: API_KEY, v: "weekly" });
    _loadPromise = importLibrary("places") as Promise<typeof google.maps.places>;
  }
  _placesLib = await _loadPromise;
  return _placesLib;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PLACE_FIELD_NAMES = [
  "id",
  "formattedAddress",
  "displayName",
  "location",
  "types",
  "googleMapsURI",
  "primaryType",
  "rating",
  "userRatingCount",
  "nationalPhoneNumber",
  "websiteURI",
];

function toGooglePlaceData(
  place: google.maps.places.Place,
  fallbackName: string,
): GooglePlaceData {
  return {
    id: place.id,
    formattedAddress: place.formattedAddress ?? "",
    displayName: place.displayName ?? fallbackName,
    location: place.location
      ? { lat: place.location.lat(), lng: place.location.lng() }
      : undefined,
    types: place.types,
    googleMapsURI: place.googleMapsURI ?? undefined,
    primaryType: place.primaryType ?? undefined,
    rating: place.rating ?? undefined,
    userRatingCount: place.userRatingCount ?? undefined,
    nationalPhoneNumber: place.nationalPhoneNumber ?? undefined,
    websiteURI: place.websiteURI ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type MapsState = "loading" | "ready" | string; // string = error message
type SearchStatus = "idle" | "searching" | string; // string = error message

interface GooglePlaceAutocompleteProps {
  value?: GooglePlaceSelection | null;
  onChange?: (selection: GooglePlaceSelection | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function GooglePlaceAutocomplete({
  value,
  onChange,
  placeholder = "Search for a place on Google Maps...",
  disabled = false,
  className,
}: GooglePlaceAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [predictions, setPredictions] = React.useState<
    google.maps.places.PlacePrediction[]
  >([]);
  const [mapsState, setMapsState] = React.useState<MapsState>("loading");
  const [searchStatus, setSearchStatus] = React.useState<SearchStatus>("idle");

  const requestIdRef = React.useRef(0);
  const sessionTokenRef =
    React.useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const selectedPlace = value?.google_place_data ?? null;

  // Preload Google Maps Places library on mount
  React.useEffect(() => {
    getPlacesLib()
      .then(() => setMapsState("ready"))
      .catch((err) =>
        setMapsState(
          err instanceof Error ? err.message : "Failed to load Google Maps",
        ),
      );
  }, []);

  // Fetch autocomplete suggestions when debounced query changes
  React.useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      setPredictions([]);
      setSearchStatus("idle");
      return;
    }

    const id = ++requestIdRef.current;

    getPlacesLib().then((lib) => {
      if (id !== requestIdRef.current) return;

      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new lib.AutocompleteSessionToken();
      }

      setSearchStatus("searching");

      lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: debouncedQuery,
        sessionToken: sessionTokenRef.current,
        includedRegionCodes: ["IN"],
      })
        .then(({ suggestions }) => {
          if (id !== requestIdRef.current) return;
          setPredictions(
            suggestions
              .map((s) => s.placePrediction)
              .filter(
                (p): p is google.maps.places.PlacePrediction => p !== null,
              ),
          );
          setSearchStatus("idle");
        })
        .catch((err) => {
          if (id !== requestIdRef.current) return;
          setSearchStatus(
            err instanceof Error
              ? err.message
              : "Failed to fetch suggestions",
          );
          setPredictions([]);
        });
    });
  }, [debouncedQuery]);

  const handleSelect = React.useCallback(
    async (prediction: google.maps.places.PlacePrediction) => {
      setOpen(false);
      setQuery("");

      try {
        const place = prediction.toPlace();
        await place.fetchFields({ fields: PLACE_FIELD_NAMES });
        onChange?.({
          place_id: place.id,
          google_place_data: toGooglePlaceData(place, prediction.text.toString()),
        });
        sessionTokenRef.current = null; // renew token after selection
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to fetch place details",
        );
      }
    },
    [onChange],
  );

  const handleClear = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(null);
      sessionTokenRef.current = null;
    },
    [onChange],
  );

  const handleOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setPredictions([]);
      setQuery("");
      setSearchStatus("idle");
    }
  }, []);

  const isDisabled = disabled || mapsState === "loading";
  const mapsUnavailable = typeof mapsState === "string" && mapsState !== "ready" && mapsState !== "loading";

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={isDisabled}
        >
          <div className="flex items-center gap-2 flex-1 text-left min-w-0">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            {mapsState === "loading" ? (
              <span className="text-muted-foreground">
                Loading Google Maps...
              </span>
            ) : mapsUnavailable ? (
              <span className="text-muted-foreground">
                Google Maps unavailable
              </span>
            ) : selectedPlace ? (
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="font-medium truncate">
                  {selectedPlace.displayName}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {selectedPlace.formattedAddress}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          {selectedPlace && (
            <div
              className="h-6 w-6 p-0 hover:bg-muted rounded flex items-center justify-center cursor-pointer shrink-0"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear place</span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search places..."
            value={query}
            onValueChange={setQuery}
            disabled={isDisabled}
            className="h-9"
            autoComplete="off"
          />
          <CommandList>
            <CommandEmpty>
              {mapsState === "loading" ? (
                <div className="flex items-center justify-center py-6 gap-2">
                  <Spinner size="md" />
                  <span>Loading Google Maps...</span>
                </div>
              ) : mapsUnavailable ? (
                <div className="py-6 text-center text-sm text-destructive">
                  <p>Failed to load Google Maps</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {mapsState}
                  </p>
                </div>
              ) : searchStatus === "searching" ? (
                <div className="flex items-center justify-center py-6 gap-2">
                  <Spinner size="md" />
                  <span>Searching...</span>
                </div>
              ) : typeof searchStatus === "string" ? (
                <div className="py-6 text-center text-sm text-destructive">
                  {searchStatus}
                </div>
              ) : debouncedQuery &&
                debouncedQuery.length >= 3 &&
                predictions.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>
                    No places found for &ldquo;{debouncedQuery}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Type at least 3 characters to search...
                </div>
              )}
            </CommandEmpty>
            {predictions.map((p) => (
              <CommandItem
                key={p.placeId}
                value={p.text.toString()}
                onSelect={() => handleSelect(p)}
              >
                <MapPin className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{p.text.toString()}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
