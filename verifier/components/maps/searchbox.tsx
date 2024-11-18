import { useRef, useState } from "react";
import {
  Box,
  ClickAwayListener,
  InputBase,
  MenuItem,
  MenuList,
  Paper,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";

import { Locations } from "@/types";

const Searchbox = ({
  locations,
}: {
  map?: google.maps.Map;
  locations: Locations;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [id, setId] = useState<number>();
  const [type, setType] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => {
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
  };

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
                onClick={() => setType("")}
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
                    setId(undefined);
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
            height: id ? 52 : 520,
            maxHeight: "calc(100vh - 96px)",
            overflowY: "auto",
            position: "absolute",
          }}
        >
          <MenuList disablePadding>
            {id ? (
              <MenuItem onClick={() => setId(undefined)}>
                <Typography
                  lineHeight={2.5}
                  color="textSecondary"
                  overflow="hidden"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                >
                  {
                    locations[type as keyof Locations]?.find(
                      (item) => item.id === id
                    )?.name
                  }
                </Typography>
              </MenuItem>
            ) : (
              locations[type as keyof Locations]?.map((item) => (
                <MenuItem
                  key={item.id}
                  selected={item.id === id}
                  onClick={() => setId(item.id)}
                >
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
    </Box>
  );
};

export default Searchbox;
