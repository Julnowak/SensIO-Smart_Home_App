import {
    Delete,
    Mail,
    Notifications as NotificationsIcon,
    Search,
    FilterList,
    MarkAsUnread,
    DoneAll,
    Close,
    ArrowBack,
    CheckBox,
    CheckBoxOutlineBlank, Checklist
} from "@mui/icons-material";
import client from "../../client";
import {API_BASE_URL} from "../../config";
import {formatDistanceToNow} from 'date-fns';
import {pl} from 'date-fns/locale';
import React, {useEffect, useState} from "react";
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
    MenuItem,
    Avatar,
    Tooltip,
    CircularProgress,
    Checkbox,
    ListItemButton
} from "@mui/material";


// Styled components
const NotificationListItem = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: "8px",
  padding: 0,
  transition: "all 0.2s ease",
  backgroundColor: selected ? theme.palette.action.selected : theme.palette.background.paper,
  borderLeft: selected ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
  boxShadow: theme.shadows[0],
  width: "auto",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[2],
  },
  "& .MuiListItemButton-root": {
    padding: "12px 16px",
  },
  "& .MuiListItemIcon-root": {
    minWidth: "36px",
  },
  "& .MuiListItemText-root": {
    marginTop: "4px",
    marginBottom: "4px",
  }
}));

const NotificationDetailPanel = styled(Paper)(({theme}) => ({
    borderRadius: "12px",
    padding: "24px",
    height: "calc(100vh - 324px)",
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
    const [checkFlag, setCheckFlag] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [readFilter, setReadFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [showMobileDetail, setShowMobileDetail] = useState(false);
    const [selectAllMode, setSelectAllMode] = useState(false);

    const token = localStorage.getItem("access");

    // Data fetching
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!token) return;
            setIsLoading(true);

            try {
                const response = await client.get(`${API_BASE_URL}notifications/`, {
                    headers: {Authorization: `Bearer ${token}`}
                });
                setNotifications(response.data.notifications);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, [token]);

    // Notification actions
    const markAsRead = async (id) => {
        try {
            setNotifications(notifications.map(notification =>
                notification.id === id ? {...notification, isRead: true} : notification
            ));

            setSelectedNotification(prev => ({
              ...prev,
              isRead: true
            }));


            await client.patch(`${API_BASE_URL}notifications/${id}/`, {type: "read"}, {
                headers: {Authorization: `Bearer ${token}`}
            });
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAsUnread = async (id) => {
        try {
            setNotifications(notifications.map(notification =>
                notification.id === id ? {...notification, isRead: false} : notification
            ));

            setSelectedNotification(prev => ({
              ...prev,
              isRead: false
            }));

            await client.patch(`${API_BASE_URL}notifications/${id}/`, {type: "unread"}, {
                headers: {Authorization: `Bearer ${token}`}
            });
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications
                .filter(n => !n.isRead)
                .map(n => n.id);

            if (unreadIds.length === 0) return;

            setNotifications(notifications.map(n => ({...n, isRead: true})));

            await Promise.all(unreadIds.map(id =>
                client.patch(`${API_BASE_URL}notifications/${id}/`, {}, {
                    headers: {Authorization: `Bearer ${token}`}
                })
            ));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const handleDelete = async (ids) => {
        try {
            await Promise.all(ids.map(id =>
                client.delete(`${API_BASE_URL}notifications/${id}/`, {
                    headers: {Authorization: `Bearer ${token}`}
                })
            ));

            // Update state after deletion
            setNotifications(notifications.filter(n => !ids.includes(n.id)));
            setSelectedNotifications(prev => prev.filter(id => !ids.includes(id)));

            if (ids.includes(selectedNotification?.id)) {
                setSelectedNotification(null);
                if (window.innerWidth < 1200) {
                    setShowMobileDetail(false);
                }
            }

            setSelectAllMode(false);
        } catch (error) {
            console.error("Failed to delete notifications", error);
        }
    };

    // Selection logic
    const handleToggleSelectAll = () => {
        if (selectAllMode) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(paginatedNotifications.map(n => n.id));
        }
        setSelectAllMode(!selectAllMode);
    };

    const handleToggleNotificationSelect = (id) => {
        const currentIndex = selectedNotifications.indexOf(id);
        const newSelected = [...selectedNotifications];

        if (currentIndex === -1) {
            newSelected.push(id);
        } else {
            newSelected.splice(currentIndex, 1);
        }

        setSelectedNotifications(newSelected);

        // If all items are selected, turn on select all mode
        if (newSelected.length === paginatedNotifications.length) {
            setSelectAllMode(true);
        } else {
            setSelectAllMode(false);
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

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) markAsRead(notification.id);
        setSelectedNotification(notification);
        if (window.innerWidth < 1200) {
            setShowMobileDetail(true);
        }
    };

    const NotificationEmptyState = () => (
        <Box sx={{p: 4, textAlign: "center", color: "text.secondary"}}>
            <NotificationsIcon sx={{fontSize: 60, mb: 2, opacity: 0.3}}/>
            <Typography variant="h6" gutterBottom>
                Brak powiadomień
            </Typography>
            <Typography variant="body2">
                {search ? "Spróbuj zmienić kryteria wyszukiwania" : "Kiedy pojawią się nowe powiadomienia, zobaczysz je tutaj"}
            </Typography>
        </Box>
    );

    const DetailPanelEmptyState = () => (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            textAlign="center"
            sx={{color: "text.secondary"}}
        >
            <Mail sx={{fontSize: 60, mb: 1, opacity: 0.3}}/>
            <Typography variant="body2" color={"gray"}>
                Kliknij na powiadomienie z listy, aby zobaczyć jego szczegóły
            </Typography>
        </Box>
    );

    return (
        <Box sx={{maxWidth: 1400, margin: "0 auto", p: {xs: 1, sm: 3}}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3}}>
                <Box sx={{mt: 4, mb: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                    <Avatar sx={{bgcolor: 'primary.main'}}>
                        <NotificationsIcon/>
                    </Avatar>
                    <Typography variant="h5" component="h1" fontWeight="600">
                        Powiadomienia
                    </Typography>
                    {notifications.filter(n => !n.isRead).length > 0 ?
                        <Chip
                            label={`${notifications.filter(n => !n.isRead).length} nieprzeczytanych`}
                            color="primary"
                            size="small"
                            sx={{ml: 1}}
                        />
                        : null}
                </Box>

                <Box sx={{display: 'flex', gap: 1}}>
                    {selectedNotifications.length > 0 ? (
                        <>
                            <Tooltip title="Usuń zaznaczone">
                                <IconButton
                                    onClick={() => handleDelete(selectedNotifications)}
                                    color="error"
                                >
                                    <Delete/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Anuluj zaznaczenie">
                                <IconButton
                                    onClick={() => {
                                        setSelectedNotifications([]);
                                        setSelectAllMode(false);
                                    }}
                                >
                                    <CheckBoxOutlineBlank/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Anuluj">
                                <IconButton onClick={() => {
                                    setSelectedNotifications([]);
                                    setSelectAllMode(false);
                                    setCheckFlag(false)
                                }}>
                                    <Close/>
                                </IconButton>
                            </Tooltip>

                        </>
                    ) : (
                        <>
                            {!checkFlag &&
                                (<Tooltip title="Oznacz wszystkie jako przeczytane">
                                    <IconButton onClick={markAllAsRead} color="primary">
                                        <DoneAll/>
                                    </IconButton>
                                </Tooltip>)
                            }
                            {!checkFlag ?
                                <Tooltip title="Tryb zaznaczania">
                                    <IconButton onClick={() => setCheckFlag(true)}>
                                        <Checklist/>
                                    </IconButton>
                                </Tooltip> :
                                <>
                                    <Tooltip title="Zaznacz wszystkie">
                                        <IconButton onClick={handleToggleSelectAll}>
                                            <CheckBox/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Anuluj">
                                        <IconButton onClick={() => setCheckFlag(false)}>
                                            <Close/>
                                        </IconButton>
                                    </Tooltip>
                                </>
                            }
                        </>
                    )}
                </Box>
            </Box>

            {/* Filter Controls */}
            <Box sx={{
                display: 'flex',
                gap: 2,
                mb: 3,
                flexDirection: {xs: 'column', sm: 'row'}
            }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="medium"
                    label="Wyszukaj powiadomienia"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    sx={{
                        borderRadius: "8px",
                        flex: 1,
                        mb: 1
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="action"/>
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    select
                    size="medium"
                    label="Filtruj"
                    value={readFilter}
                    onChange={(e) => {
                        setReadFilter(e.target.value);
                        setPage(1);
                    }}
                    sx={{minWidth: 120, mb: 1}}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FilterList fontSize="small" color="action"/>
                            </InputAdornment>
                        ),
                    }}
                >
                    <MenuItem value="all">Wszystkie</MenuItem>
                    <MenuItem value="unread">Nieprzeczytane</MenuItem>
                    <MenuItem value="read">Przeczytane</MenuItem>
                </TextField>
            </Box>

            {/* Main Content Grid */}
            <Grid container spacing={3}>
                {/* Notification List - Hidden on mobile when detail is shown */}
                <Grid item xs={12} lg={6} sx={{
                    display: {xs: showMobileDetail ? 'none' : 'block', lg: 'block'},
                    height: 'calc(100vh - 300px)',
                    position: 'relative'
                }}>
                    <Paper elevation={0} sx={{
                        borderRadius: "12px",
                        border: '1px solid',
                        borderColor: 'divider',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                    }}>
                        {isLoading ? (
                            <Box display="flex" justifyContent="center" p={4} flex={1}>
                                <CircularProgress/>
                            </Box>
                        ) : paginatedNotifications.length > 0 ? (
                            <>
                                <Box sx={{
                                    flex: 1,
                                    overflow: 'auto',
                                    '&::-webkit-scrollbar': {
                                        width: '6px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: 'transparent',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: '#ddd',
                                        borderRadius: '3px',
                                    },
                                }}>
                                    <List>
                                        {paginatedNotifications.map((notification) => (
                                            <NotificationListItem
                                                key={notification.id}
                                                selected={selectedNotification?.id === notification.id}
                                                sx={{
                                                    height: 80,
                                                    boxSizing: 'border-box',
                                                    m:1,
                                                }}
                                            >
                                                <ListItemButton
                                                    onClick={() => handleNotificationClick(notification)}
                                                    sx={{
                                                        p: '8px 16px',
                                                        height: '100%'
                                                    }}
                                                >
                                                    {checkFlag && (
                                                        <ListItemIcon sx={{minWidth: '36px'}}>
                                                            <Checkbox
                                                                edge="start"
                                                                checked={selectedNotifications.includes(notification.id)}
                                                                tabIndex={-1}
                                                                disableRipple
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleToggleNotificationSelect(notification.id);
                                                                }}
                                                                size="small"
                                                            />
                                                        </ListItemIcon>
                                                    )}

                                                    <ListItemIcon sx={{minWidth: '36px'}}>
                                                        <Badge
                                                            color="primary"
                                                            variant="dot"
                                                            invisible={notification.isRead}
                                                            anchorOrigin={{
                                                                vertical: 'top',
                                                                horizontal: 'left',
                                                            }}
                                                        >
                                                            <Mail
                                                                color={notification.isRead ? "action" : "primary"}
                                                                fontSize="small"
                                                            />
                                                        </Badge>
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={
                                                            <Typography
                                                                variant="subtitle2"
                                                                fontWeight={notification.isRead ? 400 : 600}
                                                                color={notification.isRead ? "text.secondary" : "text.primary"}
                                                            >
                                                                <b>{notification.title?.slice(0, 50) + (notification.title.length > 50? "..." : "") || "(Brak tytułu)"}</b>
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <>
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        display: "-webkit-box",
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: "vertical",
                                                                        overflow: "hidden",
                                                                        fontSize: '0.8rem'
                                                                    }}
                                                                >
                                                                    {notification.message?.slice(0, 90) + (notification.message.length > 90 ? "...": "") || "(Brak treści)"}
                                                                </Typography>
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.disabled"
                                                                    display="block"
                                                                    mt={0.5}
                                                                >
                                                                    {new Date(notification.time_triggered).toLocaleDateString()}, {new Date(notification.time_triggered).toLocaleTimeString()}
                                                                </Typography>
                                                            </>
                                                        }
                                                        sx={{my: 0}}
                                                    />
                                                </ListItemButton>
                                            </NotificationListItem>
                                        ))}
                                    </List>
                                </Box>

                                {filteredNotifications.length > perPage && (
                                    <Box sx={{
                                        p: 2,
                                        position: 'sticky',
                                        bottom: 0,
                                        backgroundColor: 'background.paper',
                                        borderTop: '1px solid',
                                        borderColor: 'divider',
                                        justifyItems: "center",
                                        zIndex: 1
                                    }}>
                                        <Pagination
                                            count={totalPages}
                                            page={page}
                                            onChange={(e, value) => setPage(value)}
                                            shape="rounded"
                                            color="primary"
                                            size="small"
                                            showFirstButton
                                            showLastButton
                                            boundaryCount={1}
                                            siblingCount={0}
                                        />
                                    </Box>
                                )}
                            </>
                        ) : (
                            <Box flex={1} display="flex" alignItems="center" justifyContent="center">
                                <NotificationEmptyState/>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Notification Detail Panel */}
                <Grid item xs={12} lg={6} sx={{
                    display: {xs: showMobileDetail ? 'block' : 'none', lg: 'block'}
                }}>
                    <NotificationDetailPanel elevation={0}>
                        {showMobileDetail && (
                            <IconButton
                                onClick={() => setShowMobileDetail(false)}
                                sx={{mb: 2, display: {lg: 'none'}}}
                            >
                                <ArrowBack/>
                            </IconButton>
                        )}

                        {selectedNotification ? (
                            <>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Typography variant="h6" fontWeight="600" sx={{mr:1}}>
                                        {selectedNotification.title}
                                    </Typography>
                                    <Chip
                                        label={formatDistanceToNow(new Date(selectedNotification.time_triggered), {
                                            addSuffix: true,
                                            locale: pl
                                        })}
                                        color="primary"
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>

                                <Divider sx={{my: 2}}/>

                                <Typography
                                    variant="body2"
                                    paragraph
                                    sx={{
                                        lineHeight: 1.7,
                                        whiteSpace: 'pre-line',
                                        fontSize: '0.9rem',
                                        textAlign: "justify"
                                    }}
                                >
                                    {selectedNotification.message || "Brak szczegółowej treści powiadomienia"}
                                </Typography>

                                <Box sx={{
                                    mt: 4,
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: 1
                                }}>
                                    {selectedNotification.isRead && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<MarkAsUnread/>}
                                            onClick={() => markAsUnread(selectedNotification.id)}
                                        >
                                            Oznacz jako nieprzeczytane
                                        </Button>
                                    )}
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="error"
                                        startIcon={<Delete/>}
                                        onClick={() => handleDelete([selectedNotification.id])}
                                    >
                                        Usuń
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <DetailPanelEmptyState/>
                        )}
                    </NotificationDetailPanel>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Notifications;