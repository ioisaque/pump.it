import { Dialog, DialogContent } from "@mui/material";
import GoogleMapEmbed from "components/GoogleMapEmbed";
import { useMobileDialog } from "hooks/useMobileDialog";

export type MapLocation = {
  latitude: number;
  longitude: number;
};

interface MapDialogProps {
  id: string;
  marker: MapLocation;
  center: MapLocation;
  isOpen: boolean;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function MapDialog(props: MapDialogProps) {
  const mobileDialog = useMobileDialog("sm");

  return (
    <Dialog id={props.id} open={props.isOpen} onClose={props.onCancel} {...mobileDialog}>
      <DialogContent sx={{ minHeight: 100, width: "100%", p: 2 }}>
        <GoogleMapEmbed
          latitude={props.center.latitude}
          longitude={props.center.longitude}
          height={400}
        />
      </DialogContent>
    </Dialog>
  );
}
