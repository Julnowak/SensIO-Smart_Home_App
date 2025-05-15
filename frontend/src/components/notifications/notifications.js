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
    Divider,
    Button,
    InputAdornment,
    Checkbox,
    MenuItem
} from "@mui/material";
import { Delete, Mail, CircleNotifications, Search } from "@mui/icons-material";
import client from "../../client";
import { API_BASE_URL } from "../../config";

// Styled components
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
    // State management
    const [notifications, setNotifications] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [perPage] = useState(5);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [readFilter, setReadFilter] = useState("all");

    const token = localStorage.getItem("access");

    // Data fetching
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!token) return;

            try {
                const response = await client.get(`${API_BASE_URL}notifications/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(response.data.notifications);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };

        fetchNotifications();
    }, [token]);

    // Notification actions
    const markAsRead = async (id) => {
        try {
            setNotifications(notifications.map(notification =>
                notification.id === id ? { ...notification, isRead: true } : notification
            ));

            await client.patch(`${API_BASE_URL}notifications/${id}/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleDelete = async (ids) => {
        try {
            await Promise.all(ids.map(id =>
                client.delete(`${API_BASE_URL}notifications/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ));

            // Update state after deletion
            setNotifications(notifications.filter(n => !ids.includes(n.id)));
            setSelectedNotifications(prev => prev.filter(id => !ids.includes(id)));

            if (ids.includes(selectedNotification?.id)) {
                setSelectedNotification(null);
            }
        } catch (error) {
            console.error("Failed to delete notifications", error);
        }
    };

    // Filtering and pagination logic
    const filteredNotifications = notifications.filter((notification) => {
        const matchesSearch = notification.title?.toLowerCase().includes(search.toLowerCase()) ||
                           notification.message?.toLowerCase().includes(search.toLowerCase());

        const matchesRead = readFilter === 'all' ||
                         (readFilter === 'read' && notification.isRead) ||
                         (readFilter === 'unread' && !notification.isRead);

        return matchesSearch && matchesRead;
    });

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);
    const totalPages = Math.ceil(Math.max(filteredNotifications.length, 1) / perPage);

    // Selection handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const newIds = paginatedNotifications
                .map(n => n.id)
                .filter(id => !selectedNotifications.includes(id));
            setSelectedNotifications([...selectedNotifications, ...newIds]);
        } else {
            const newIds = selectedNotifications.filter(
                id => !paginatedNotifications.map(n => n.id).includes(id)
            );
            setSelectedNotifications(newIds);
        }
    };

    // Helper components
    const NotificationEmptyState = () => (
        <Typography variant="body1" sx={{ p: 3, textAlign: "center" }}>
            Brak powiadomień do wyświetlenia
        </Typography>
    );

    const DetailPanelEmptyState = () => (
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
    );

    return (
        <Box sx={{ maxWidth: 1400, margin: "0 auto", p: 3 }}>
            {/* Header Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                <CircleNotifications fontSize="large" color="primary" />
                <Typography variant="h4" component="h1">
                    Powiadomienia
                </Typography>
            </Box>

            {/* Filter Controls */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Wyszukaj powiadomienia..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ borderRadius: "12px" }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    select
                    label="Status"
                    value={readFilter}
                    onChange={(e) => setReadFilter(e.target.value)}
                    sx={{ minWidth: 120 }}
                >
                    <MenuItem value="all">Wszystkie</MenuItem>
                    <MenuItem value="read">Przeczytane</MenuItem>
                    <MenuItem value="unread">Nieprzeczytane</MenuItem>
                </TextField>
            </Box>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography>
                        Wybrano {selectedNotifications.length} powiadomień
                    </Typography>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(selectedNotifications)}
                    >
                        Usuń wybrane
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setSelectedNotifications([])}
                    >
                        Anuluj
                    </Button>
                </Box>
            )}

            {/* Main Content Grid */}
            <Grid container spacing={4}>
                {/* Notifications List */}
                <Grid item xs={12} lg={6}>
                    <Paper elevation={2} sx={{ borderRadius: "16px", p: 2 }}>
                        <List>
                            <ListItem>
                                <ListItemIcon sx={{ minWidth: "40px" }}>
                                    <Checkbox
                                        checked={paginatedNotifications.length > 0 &&
                                                paginatedNotifications.every(n => selectedNotifications.includes(n.id))}
                                        indeterminate={
                                            paginatedNotifications.some(n => selectedNotifications.includes(n.id)) &&
                                            !paginatedNotifications.every(n => selectedNotifications.includes(n.id))
                                        }
                                        onChange={handleSelectAll}
                                    />
                                </ListItemIcon>
                                <ListItemText primary="Zaznacz wszystkie" />
                            </ListItem>

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
                                        <ListItemIcon sx={{ minWidth: "40px", display: 'flex', alignItems: 'center' }}>
                                            {/*<Checkbox*/}
                                            {/*    checked={selectedNotifications.includes(notification.id)}*/}
                                            {/*    onChange={(e) => {*/}
                                            {/*        e.stopPropagation();*/}
                                            {/*        setSelectedNotifications(prev =>*/}
                                            {/*            prev.includes(notification.id)*/}
                                            {/*                ? prev.filter(id => id !== notification.id)*/}
                                            {/*                : [...prev, notification.id]*/}
                                            {/*        );*/}
                                            {/*    }}*/}
                                            {/*    sx={{ p: 0, mr: 1 }}*/}
                                            {/*/>*/}
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
                                                label={new Date(notification.time_triggered).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                                size="small"
                                                sx={{ borderRadius: "8px" }}
                                            />
                                            <IconButton
                                                edge="end"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete([notification.id]);
                                                }}
                                                color="error"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    </NotificationListItem>
                                ))
                            ) : (
                                <NotificationEmptyState />
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

                {/* Notification Detail Panel */}
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
                                <Typography
                                    variant="body1"
                                    paragraph
                                    sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}
                                >
                                    {selectedNotification.message || "Brak szczegółowej treści powiadomienia"}
                                </Typography>
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={() => handleDelete([selectedNotification.id])}
                                    >
                                        Usuń powiadomienie
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <DetailPanelEmptyState />
                        )}
                    </NotificationDetailPanel>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Notifications;