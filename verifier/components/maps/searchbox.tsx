import { useEffect, useRef, useState } from "react";
import {
  Box,
  ClickAwayListener,
  InputBase,
  MenuItem,
  MenuList,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";

import { Amenity, Area, Boundary, Locations } from "@/types";

const Searchbox = ({
  map,
  locations,
}: {
  map?: google.maps.Map;
  locations: Locations;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loc, setLoc] = useState<Area | Amenity>();
  const [type, setType] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [, setLines] = useState<google.maps.Polygon[]>();
  const [markers, setMarkers] =
    useState<google.maps.marker.AdvancedMarkerElement[]>();

  const onOpen = () => {
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
  };

  const onResetLines = () => {
    setLines((prev) => {
      if (prev) prev.forEach((line) => line.setMap(null));
      return undefined;
    });
  };

  const onResetMarkers = () => {
    setMarkers((prev) => {
      if (prev) prev.forEach((marker) => (marker.map = null));
      return undefined;
    });
  };

  useEffect(() => {
    onResetLines();
    onResetMarkers();
    if (type) {
      if (loc) {
        locations[type as keyof Locations]?.forEach((item) => {
          if ("boundaries" in item && item.id === loc.id) {
            const boundaries = item.boundaries as Boundary[];
            const paths = boundaries.map((boundary) => ({
              lat: boundary.lat,
              lng: boundary.lon,
            }));
            const polygon = new google.maps.Polygon({
              paths,
              map,
              strokeColor: "#FF0000",
              strokeOpacity: 1,
              strokeWeight: 2.5,
              fillColor: "#FF0000",
              fillOpacity: 0.05,
            });
            setLines([polygon]);
            const marker = new google.maps.marker.AdvancedMarkerElement({
              position: { lat: item.lat, lng: item.lon },
              title: item.id.toString(),
              map,
            });
            setMarkers([marker]);
          } else if ("latitude" in item && item.id === loc.id) {
            const marker = new google.maps.marker.AdvancedMarkerElement({
              position: { lat: item.latitude, lng: item.longitude },
              map,
            });
            setMarkers([marker]);
          }
        });
      } else {
        locations[type as keyof Locations]?.forEach((item) => {
          if ("boundaries" in item) {
            const boundaries = item.boundaries as Boundary[];
            const paths = boundaries.map((boundary) => ({
              lat: boundary.lat,
              lng: boundary.lon,
            }));
            const polygon = new google.maps.Polygon({
              paths,
              map,
              strokeColor: "#FF0000",
              strokeOpacity: 1,
              strokeWeight: 2.5,
              fillColor: "#FF0000",
              fillOpacity: 0.05,
            });
            setLines((prev) => {
              return prev ? [...prev, polygon] : [polygon];
            });
            const marker = new google.maps.marker.AdvancedMarkerElement({
              position: { lat: item.lat, lng: item.lon },
              title: item.id.toString(),
              map,
            });
            setMarkers((prev) => {
              return prev ? [...prev, marker] : [marker];
            });
          } else if ("latitude" in item) {
            const marker = new google.maps.marker.AdvancedMarkerElement({
              position: { lat: item.latitude, lng: item.longitude },
              title: item.id.toString(),
              map,
            });
            setMarkers((prev) => {
              return prev ? [...prev, marker] : [marker];
            });
          }
        });
      }
    }
  }, [map, type, loc, locations]);

  useEffect(() => {
    markers?.forEach((marker) => {
      marker.addListener("click", () => {
        setLoc((prev) =>
          prev
            ? undefined
            : locations[type as keyof Locations]?.find(
                (item) => item.id === parseInt(marker.title)
              )
        );
      });
    });
  }, [locations, markers, type]);

  return (
    <Box
      top={16}
      left={16}
      right={16}
      zIndex={100}
      width={{ sm: 300 }}
      position="absolute"
    >
      <ClickAwayListener onClickAway={onClose}>
        <Box>
          <Paper
            elevation={3}
            sx={{
              px: 3,
              py: 1.5,
              mx: 0.5,
              display: "flex",
              alignItems: "center",
              borderRadius: 6,
              borderEndEndRadius: isOpen ? 0 : 24,
              borderEndStartRadius: isOpen ? 0 : 24,
            }}
          >
            <InputBase
              fullWidth
              size="small"
              ref={inputRef}
              value={type}
              placeholder="Pilih tipe lokasi"
              inputProps={{
                readOnly: true,
                style: { padding: 0, textTransform: "capitalize" },
              }}
              onFocus={onOpen}
            />
            {type ? (
              <Close
                color="action"
                fontSize="small"
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  setType("");
                  setLoc(undefined);
                }}
              />
            ) : null}
          </Paper>
          <Paper
            square
            elevation={3}
            onClick={(e) => e.stopPropagation()}
            sx={{
              mb: 1,
              mx: 0.5,
              height: "100%",
              borderEndEndRadius: 24,
              borderEndStartRadius: 24,
              display: isOpen ? "block" : "none",
            }}
          >
            <MenuList>
              {Object.keys(locations).map((key) => (
                <MenuItem
                  key={key}
                  selected={key === type}
                  onClick={() => {
                    onClose();
                    setType(key);
                    setLoc(undefined);
                  }}
                >
                  <Typography
                    lineHeight={2}
                    color="textSecondary"
                    textTransform="capitalize"
                  >
                    {key}
                  </Typography>
                </MenuItem>
              ))}
            </MenuList>
          </Paper>
        </Box>
      </ClickAwayListener>

      {type ? (
        <Paper
          elevation={3}
          sx={{
            mx: 0.5,
            top: 64,
            left: 0,
            right: 0,
            zIndex: -1,
            maxHeight: loc ? 52 : 520,
            overflowY: "auto",
            position: "absolute",
          }}
        >
          <MenuList disablePadding>
            {loc ? (
              <MenuItem onClick={() => setLoc(undefined)}>
                <Typography
                  lineHeight={2.5}
                  color="textSecondary"
                  overflow="hidden"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                >
                  {loc?.name}
                </Typography>
              </MenuItem>
            ) : (
              locations[type as keyof Locations]?.map((item) => (
                <MenuItem key={item.id} onClick={() => setLoc(item)}>
                  <Typography
                    lineHeight={2.5}
                    color="textSecondary"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                  >
                    {item.name}
                  </Typography>
                </MenuItem>
              ))
            )}
          </MenuList>
        </Paper>
      ) : null}

      {loc ? (
        <Paper
          elevation={3}
          sx={{
            mx: 0.5,
            top: 132,
            left: 0,
            right: 0,
            zIndex: -1,
            maxHeight: "calc(100vh - 96px)",
            overflowY: "auto",
            position: "absolute",
          }}
        >
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography color="textSecondary" variant="body2">
                    OSM ID
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography color="textSecondary" variant="body2">
                    {loc?.id}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography color="textSecondary" variant="body2">
                    Koordinat
                  </Typography>
                </TableCell>
                <TableCell>
                  {loc ? (
                    <Typography color="textSecondary" variant="body2">
                      {"boundaries" in loc ? (
                        <span>
                          {loc?.lat}, {loc?.lon}
                        </span>
                      ) : (
                        <span>
                          {loc?.latitude}, {loc?.longitude}
                        </span>
                      )}
                    </Typography>
                  ) : null}
                </TableCell>
              </TableRow>
              {loc.alt_name.length ? (
                <TableRow>
                  <TableCell>
                    <Typography color="textSecondary" variant="body2">
                      Nama lain
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography color="textSecondary" variant="body2">
                      {loc.alt_name.join(", ")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Paper>
      ) : null}
    </Box>
  );
};

export default Searchbox;
