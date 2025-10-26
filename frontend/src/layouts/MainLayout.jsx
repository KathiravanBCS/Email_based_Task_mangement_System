import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Avatar,
  Menu,
  Badge,
  ActionIcon,
  TextInput,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconChecklist,
  IconCalendar,
  IconLayoutKanban,
  IconFolder,
  IconBell,
  IconSettings,
  IconLogout,
  IconSearch,
  IconSun,
  IconMoon,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { notifications } from '@mantine/notifications';
import { notificationAPI } from '../services/api';

function MainLayout() {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const { data: unreadCount } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const response = await notificationAPI.getUnreadCount();
      return response.data.data.count;
    },
    refetchInterval: 30000,
  });

  const unreadNotifications = unreadCount || 0;

  const navItems = [
    { label: 'Dashboard', icon: IconDashboard, path: '/dashboard' },
    { label: 'Tasks', icon: IconChecklist, path: '/tasks' },
    { label: 'Calendar', icon: IconCalendar, path: '/calendar' },
    { label: 'Kanban', icon: IconLayoutKanban, path: '/kanban' },
    ...(user?.role !== 'user' ? [{ label: 'Categories', icon: IconFolder, path: '/categories' }] : []),
    ...(user?.role === 'admin' ? [{ label: 'Users', icon: IconUsers, path: '/users' }] : []),
    { label: 'Notifications', icon: IconBell, path: '/notifications', badge: unreadNotifications },
  ];

  const handleLogout = () => {
    logout();
    notifications.show({
      title: 'Logged out',
      message: 'You have been successfully logged out',
      color: 'blue',
    });
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group>
              <IconChecklist size={28} color="#228BE6" />
              <span style={{ fontWeight: 700, fontSize: 20 }}>Task Manager</span>
            </Group>
          </Group>

          <Group>
            <TextInput
              placeholder="Search tasks..."
              leftSection={<IconSearch size={16} />}
              style={{ width: 300 }}
              visibleFrom="md"
            />

            <ActionIcon
              variant="subtle"
              onClick={toggleColorScheme}
              size="lg"
            >
              {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>

            <ActionIcon variant="subtle" size="lg" onClick={() => navigate('/notifications')} style={{ position: 'relative' }}>
              <IconBell size={20} />
              {unreadNotifications > 0 && (
                <Badge
                  size="xs"
                  circle
                  style={{ position: 'absolute', top: -2, right: -2 }}
                  color="red"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </ActionIcon>

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Avatar
                  src={user?.avatar_url}
                  alt={user?.full_name}
                  radius="xl"
                  style={{ cursor: 'pointer' }}
                >
                  {user?.full_name?.charAt(0)}
                </Avatar>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{user?.full_name}</Menu.Label>
                <Menu.Item
                  leftSection={<IconUser size={14} />}
                  onClick={() => navigate('/profile')}
                >
                  Profile
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconSettings size={14} />}
                  onClick={() => navigate('/settings')}
                >
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  color="red"
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            label={item.label}
            leftSection={<item.icon size={20} />}
            rightSection={
              item.badge ? (
                <Badge size="sm" color="red">
                  {item.badge}
                </Badge>
              ) : null
            }
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            style={{ marginBottom: 4 }}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export default MainLayout;
