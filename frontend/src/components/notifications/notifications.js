import React, { useEffect, useState } from "react";
import {
    Box,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Pagination,
    TextField,
    Badge,
    IconButton,
    Typography,
    styled,
    Grid,
    Paper,
    Divider, Button, InputAdornment
} from "@mui/material";
import {Delete, Mail, CircleNotifications, Search} from "@mui/icons-material";
import client from "../../client";
import { API_BASE_URL } from "../../config";

const NotificationListItem = styled(ListItem)(({ theme, selected }) => ({
    borderRadius: "12px",
    margin: "8px 0",
    transition: "all 0.3s ease",
    backgroundColor: selected ? theme.palette.action.selected : theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    "&:hover": {
        transform: "translateX(4px)",
        boxShadow: theme.shadows[4],
        backgroundColor: theme.palette.action.hover
    },
}));

const NotificationDetailPanel = styled(Paper)(({ theme }) => ({
    borderRadius: "16px",
    padding: "24px",
    height: "calc(100vh - 200px)",
    overflow: "auto",
    position: "sticky",
    top: "20px",
    [theme.breakpoints.down('lg')]: {
        height: "auto",
        position: "relative",
        top: 0,
        marginTop: "20px"
    }
}));

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [perPage] = useState(5);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const token = localStorage.getItem("access");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await client.get(API_BASE_URL + "notifications/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setNotifications(response.data.notifications);
                // Automatically select first notification if none selected
                if (!selectedNotification && response.data.notifications.length > 0) {
                    setSelectedNotification(response.data.notifications[0]);
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);

    const markAsRead = async (id) => {
        setNotifications(notifications.map(notification =>
            notification.id === id ? { ...notification, isRead: true } : notification
        ));

        try {
            await client.patch(API_BASE_URL + `notifications/${id}/`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await client.delete(API_BASE_URL + `notifications/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setNotifications(notifications.filter(n => n.id !== id));
            if (selectedNotification?.id === id) {
                setSelectedNotification(notifications.length > 1 ?
                    notifications.find(n => n.id !== id) : null);
            }
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    const filteredNotifications = notifications.filter((notification) =>
        notification.title?.toLowerCase().includes(search.toLowerCase()) ||
        notification.message?.toLowerCase().includes(search.toLowerCase())
    );

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);
    const totalPages = Math.ceil(Math.max(filteredNotifications.length, 1) / perPage);

    return (
        <Box sx={{ maxWidth: 1400, margin: "0 auto", p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                <CircleNotifications fontSize="large" color="primary" />
                <Typography variant="h4" component="h1">
                    Powiadomienia
                </Typography>
            </Box>

            <TextField
                fullWidth
                variant="outlined"
                label="Wyszukaj powiadomienia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 4, borderRadius: "12px" }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
            />

            <Grid container spacing={4}>
                {/* Lista powiadomień */}
                <Grid item xs={12} lg={6}>
                    <Paper elevation={2} sx={{ borderRadius: "16px", p: 2 }}>
                        <List>
                            {paginatedNotifications.length > 0 ? (
                                paginatedNotifications.map((notification) => (
                                    <NotificationListItem
                                        key={notification.id}
                                        selected={selectedNotification?.id === notification.id}
                                        onClick={() => {
                                            if (!notification.isRead) markAsRead(notification.id);
                                            setSelectedNotification(notification);
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: "40px" }}>
                                            <Badge
                                                color="primary"
                                                variant="dot"
                                                invisible={notification.isRead}
                                            >
                                                <Mail color={notification.isRead ? "action" : "primary"} />
                                            </Badge>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight={600}
                                                    color={notification.isRead ? "text.secondary" : "text.primary"}
                                                >
                                                    {notification.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden"
                                                    }}
                                                >
                                                    {notification.message?.slice(0, 100) || "(Brak treści)"}
                                                </Typography>
                                            }
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip
                                                label={new Date(notification.time_triggered).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                size="small"
                                                sx={{ borderRadius: "8px" }}
                                            />
                                            <IconButton
                                                edge="end"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notification.id);
                                                }}
                                                color="error"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    </NotificationListItem>
                                ))
                            ) : (
                                <Typography variant="body1" sx={{ p: 3, textAlign: "center" }}>
                                    Brak powiadomień do wyświetlenia
                                </Typography>
                            )}
                        </List>

                        {filteredNotifications.length > perPage && (
                            <Box display="flex" justifyContent="center" mt={3}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(e, value) => setPage(value)}
                                    shape="rounded"
                                    color="primary"
                                />
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Panel szczegółów powiadomienia */}
                <Grid item xs={12} lg={6}>
                    <NotificationDetailPanel elevation={3}>
                        {selectedNotification ? (
                            <>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                    <Typography variant="h5" fontWeight="600">
                                        {selectedNotification.title}
                                    </Typography>
                                    <Chip
                                        label={new Date(selectedNotification.time_triggered).toLocaleString()}
                                        color="primary"
                                        size="small"
                                    />
                                </Box>
                                <Divider sx={{ mb: 3 }} />
                                <Typography variant="body1" paragraph sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                                    {selectedNotification.message || "Brak szczegółowej treści powiadomienia"}
                                </Typography>
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={() => handleDelete(selectedNotification.id)}
                                    >
                                        Usuń powiadomienie
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                height="100%"
                                textAlign="center"
                                sx={{ color: "text.secondary" }}
                            >
                                <Mail sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                                <Typography variant="h6">
                                    Wybierz powiadomienie, aby zobaczyć szczegóły
                                </Typography>
                            </Box>
                        )}
                    </NotificationDetailPanel>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Notifications;