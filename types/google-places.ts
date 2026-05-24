import { z } from "zod";

export const googlePlaceDataSchema = z.object({
  id: z.string(),
  formattedAddress: z.string(),
  displayName: z.string(),
  location: z.object({ lat: z.number(), lng: z.number() }).optional(),
  types: z.array(z.string()).optional(),
  googleMapsURI: z.string().optional(),
  primaryType: z.string().optional(),
  rating: z.number().optional(),
  userRatingCount: z.number().optional(),
  nationalPhoneNumber: z.string().optional(),
  websiteURI: z.string().optional(),
});

export type GooglePlaceData = z.infer<typeof googlePlaceDataSchema>;

export type GooglePlaceSelection = {
  place_id: string;
  google_place_data: GooglePlaceData;
};
