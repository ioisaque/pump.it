import { Icon } from "@iconify/react";
import { Box, Card, CardContent, Skeleton, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: string;
  loading?: boolean;
  to?: string;
};

export default function StatCard({ title, value, subtitle, icon, color, loading, to }: StatCardProps) {
  const body = (
    <Card
      sx={{
        height: "100%",
        borderLeft: `4px solid ${color}`,
        transition: "box-shadow 0.2s",
        ...(to ? { "&:hover": { boxShadow: 2 } } : {}),
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: `${color}18`,
              color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon icon={icon} width={24} />
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {title}
            </Typography>
            {loading ? (
              <Skeleton width="60%" height={36} sx={{ mt: 0.5 }} />
            ) : (
              <Typography variant="h5" fontWeight={700} lineHeight={1.2} sx={{ mt: 0.25 }}>
                {value}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  if (to) {
    return (
      <Box component={Link} to={to} sx={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
        {body}
      </Box>
    );
  }

  return body;
}
