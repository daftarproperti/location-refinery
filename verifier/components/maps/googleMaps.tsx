"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import { Box } from "@mui/material";

import { Data } from "@/types";
import { observeElementById } from "@/utils";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "./constants";

const GoogleMaps = ({ data = {} }: { data?: Data }) => {
  const { cityInfo } = data;
  const [, setMapState] = useState<google.maps.Map>();

  const center: google.maps.LatLngLiteral = useMemo(
    () =>
      cityInfo
        ? {
            lat: cityInfo?.lat as number,
            lng: cityInfo?.lon as number,
          }
        : DEFAULT_MAP_CENTER,
    [cityInfo]
  );

  const initMap = useCallback(async () => {
    const { Map } = (await google.maps.importLibrary(
      "maps"
    )) as google.maps.MapsLibrary;
    (await google.maps.importLibrary("marker")) as google.maps.MarkerLibrary;

    const map = new Map(document.getElementById("map") as HTMLElement, {
      center,
      zoom: DEFAULT_MAP_ZOOM,
      mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID as string,
      gestureHandling: "greedy",
      disableDefaultUI: true,
      zoomControl: true,
    });
    setMapState(map);
  }, [center]);

  useEffect(() => {
    observeElementById("map").then(initMap);
  }, [initMap]);

  return (
    <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
      <Box id="map" top={0} left={0} right={0} bottom={0} position="absolute" />
    </Wrapper>
  );
};

export default GoogleMaps;
