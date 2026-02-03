/**
 * LMS Dashboard - Main Entry Point
 * Role-based dashboard with navigation to main app
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
  ExitToApp as ExitToAppIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  Event as EventIcon,
  Class as ClassIcon,
  Book as BookIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { getNotifications, markAllNotificationsRead } from '../services/lmsApi';

const LMSDashboard = ({ userRole, userData }) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications({ is_read: false, limit: 10 });
      setNotifications(response.notifications);
      setUnreadCount(response.unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      fetchNotifications();
      setAnchorElNotif(null);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const getNavigationItems = () => {
    const commonItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/lms/dashboard' },
      { text: 'Calendar', icon: <CalendarIcon />, path: '/lms/calendar' },
      { text: 'Announcements', icon: <EventIcon />, path: '/lms/announcements' },
    ];

    const roleSpecificItems = {
      SUPER_ADMIN: [
        { text: 'Schools', icon: <SchoolIcon />, path: '/lms/schools' },
        { text: 'Analytics', icon: <BarChartIcon />, path: '/lms/analytics/school' },
        { text: 'Users', icon: <PeopleIcon />, path: '/lms/users' },
      ],
      SCHOOL_ADMIN: [
        { text: 'Classes', icon: <ClassIcon />, path: '/lms/classes' },
        { text: 'Courses', icon: <BookIcon />, path: '/lms/courses' },
        { text: 'Teachers', icon: <PersonIcon />, path: '/lms/teachers' },
        { text: 'Students', icon: <PeopleIcon />, path: '/lms/students' },
        { text: 'Parents', icon: <PeopleIcon />, path: '/lms/parents' },
        { text: 'Analytics', icon: <BarChartIcon />, path: '/lms/analytics' },
      ],
      TEACHER: [
        { text: 'My Courses', icon: <BookIcon />, path: '/lms/my-courses' },
        { text: 'Assignments', icon: <AssignmentIcon />, path: '/lms/assignments' },
        { text: 'Grading', icon: <GradeIcon />, path: '/lms/grading' },
        { text: 'Attendance', icon: <PeopleIcon />, path: '/lms/attendance' },
        { text: 'Exams', icon: <AssessmentIcon />, path: '/lms/exams' },
        { text: 'Students', icon: <PeopleIcon />, path: '/lms/students' },
      ],
      STUDENT: [
        { text: 'My Courses', icon: <BookIcon />, path: '/lms/my-courses' },
        { text: 'Assignments', icon: <AssignmentIcon />, path: '/lms/assignments' },
        { text: 'My Grades', icon: <GradeIcon />, path: '/lms/grades' },
        { text: 'Attendance', icon: <CalendarIcon />, path: '/lms/attendance' },
        { text: 'Exams', icon: <AssessmentIcon />, path: '/lms/exams' },
      ],
      PARENT: [
        { text: 'My Children', icon: <PeopleIcon />, path: '/lms/children' },
        { text: 'Grades', icon: <GradeIcon />, path: '/lms/children/grades' },
        { text: 'Attendance', icon: <CalendarIcon />, path: '/lms/children/attendance' },
        { text: 'Teachers', icon: <PersonIcon />, path: '/lms/teachers' },
      ],
    };

    return [...commonItems, ...(roleSpecificItems[userRole] || [])];
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const navigationItems = getNavigationItems();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            MySchool LMS
          </Typography>

          {/* Button to go to main app */}
          <Button
            color="inherit"
            startIcon={<HomeIcon />}
            component={Link}
            to="/"
            sx={{ mr: 2 }}
          >
            Go to MySchool Main App
          </Button>

          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={(e) => setAnchorElNotif(e.currentTarget)}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton
            onClick={(e) => setAnchorElUser(e.currentTarget)}
            sx={{ ml: 2 }}
          >
            <Avatar>{userData?.name?.charAt(0) || 'U'}</Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Notifications Menu */}
      <Menu
        anchorEl={anchorElNotif}
        open={Boolean(anchorElNotif)}
        onClose={() => setAnchorElNotif(null)}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '350px',
          },
        }}
      >
        <MenuItem disabled>
          <Typography variant="h6">Notifications</Typography>
        </MenuItem>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </MenuItem>
        ) : (
          notifications.map((notif) => (
            <MenuItem
              key={notif.id}
              onClick={() => {
                navigate(notif.link || '/lms/notifications');
                setAnchorElNotif(null);
              }}
            >
              <Box>
                <Typography variant="subtitle2">{notif.title}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {notif.message}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
        <Divider />
        <MenuItem onClick={handleMarkAllRead}>
          <Typography variant="body2" color="primary">
            Mark all as read
          </Typography>
        </MenuItem>
      </Menu>

      {/* User Menu */}
      <Menu
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={() => setAnchorElUser(null)}
      >
        <MenuItem disabled>
          <Box>
            <Typography variant="subtitle1">{userData?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {userRole}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => navigate('/lms/profile')}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/lms/settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={() => navigate('/logout')}>
          <ListItemIcon>
            <ExitToAppIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Side Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Toolbar />
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {navigationItems.map((item) => (
              <ListItem
                button
                key={item.text}
                component={Link}
                to={item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          mt: 8,
        }}
      >
        <Container maxWidth="xl">
          {/* Dashboard Content - Quick Stats */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>
                Welcome to LMS Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Role: {userRole}
              </Typography>
            </Grid>

            {/* Quick Stats Cards */}
            {userRole === 'TEACHER' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        My Courses
                      </Typography>
                      <Typography variant="h4">5</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Pending Grading
                      </Typography>
                      <Typography variant="h4">12</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Students
                      </Typography>
                      <Typography variant="h4">150</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Assignments
                      </Typography>
                      <Typography variant="h4">28</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {userRole === 'STUDENT' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Enrolled Courses
                      </Typography>
                      <Typography variant="h4">6</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Pending Assignments
                      </Typography>
                      <Typography variant="h4">4</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Attendance
                      </Typography>
                      <Typography variant="h4">92%</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Average Grade
                      </Typography>
                      <Typography variant="h4">B+</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {userRole === 'SCHOOL_ADMIN' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Students
                      </Typography>
                      <Typography variant="h4">850</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Total Teachers
                      </Typography>
                      <Typography variant="h4">45</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Active Courses
                      </Typography>
                      <Typography variant="h4">38</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary" gutterBottom>
                        Attendance Rate
                      </Typography>
                      <Typography variant="h4">89%</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {/* Recent Activity */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title="Recent Activity" />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Recent activities will be displayed here...
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Upcoming Events */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Upcoming Events" />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming events will be displayed here...
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LMSDashboard;
