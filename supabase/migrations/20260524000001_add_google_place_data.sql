ALTER TABLE clinics ADD COLUMN IF NOT EXISTS google_place_data jsonb;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS google_place_data jsonb;

COMMENT ON COLUMN clinics.google_place_data IS 'Cached data from Google Places API (new): id, formattedAddress, displayName, location, types, googleMapsURI, primaryType, rating, userRatingCount, nationalPhoneNumber, websiteURI';
COMMENT ON COLUMN doctors.google_place_data IS 'Cached data from Google Places API (new): id, formattedAddress, displayName, location, types, googleMapsURI, primaryType, rating, userRatingCount, nationalPhoneNumber, websiteURI';
