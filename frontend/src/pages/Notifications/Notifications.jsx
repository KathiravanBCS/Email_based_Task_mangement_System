import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Stack,
  Title,
  Text,
  Card,
  Group,
  Badge,
  ActionIcon,
  Button,
  Tabs,
  Avatar,
  Box,
} from '@mantine/core';
import { IconCheck, IconTrash, IconBell, IconBellOff } from '@tabler/icons-react';
import { notifications as mantineNotifications } from '@mantine/notifications';
import { notificationAPI } from '../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

function Notifications() {
  const queryClient = useQueryClient();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationAPI.getAll({ limit: 50 });
      return response.data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unread-count']);
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unread-count']);
      mantineNotifications.show({
        title: 'Success',
        message: 'All notifications marked as read',
        color: 'green',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      mantineNotifications.show({
        title: 'Deleted',
        message: 'Notification deleted',
        color: 'blue',
      });
    },
  });

  const getNotificationIcon = (type) => {
    return type === 'task_assignment' ? '📋' : 
           type === 'due_date_reminder' ? '⏰' : 
           type === 'status_update' ? '✅' : 
           type === 'comment' ? '💬' : '🔔';
  };

  const getNotificationColor = (type) => {
    return type === 'task_assignment' ? 'blue' : 
           type === 'due_date_reminder' ? 'orange' : 
           type === 'status_update' ? 'green' : 
           type === 'comment' ? 'violet' : 'gray';
  };

  const unreadNotifications = notificationsData?.data?.filter(n => !n.is_read) || [];
  const readNotifications = notificationsData?.data?.filter(n => n.is_read) || [];

  const NotificationCard = ({ notification }) => (
    <Card
      shadow="xs"
      padding="md"
      withBorder
      style={{
        backgroundColor: notification.is_read ? 'transparent' : '#f0f7ff',
        borderLeft: notification.is_read ? 'none' : '4px solid #228BE6',
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Group align="flex-start" style={{ flex: 1 }}>
          <Box
            style={{
              fontSize: 32,
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 24,
              backgroundColor: '#f8f9fa',
            }}
          >
            {getNotificationIcon(notification.notification_type)}
          </Box>

          <div style={{ flex: 1 }}>
            <Group gap="xs" mb={5}>
              <Text fw={600}>{notification.title}</Text>
              <Badge size="xs" color={getNotificationColor(notification.notification_type)}>
                {notification.notification_type.replace('_', ' ')}
              </Badge>
              {!notification.is_read && (
                <Badge size="xs" color="blue" variant="filled">
                  New
                </Badge>
              )}
            </Group>
            
            {notification.message && (
              <Text size="sm" c="dimmed" mb={5}>
                {notification.message}
              </Text>
            )}

            {notification.task_title && (
              <Text size="sm" c="dimmed">
                Task: <strong>{notification.task_title}</strong>
              </Text>
            )}

            <Text size="xs" c="dimmed" mt={8}>
              {dayjs(notification.created_at).fromNow()}
            </Text>
          </div>
        </Group>

        <Group gap="xs">
          {!notification.is_read && (
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={() => markAsReadMutation.mutate(notification.id)}
              loading={markAsReadMutation.isPending}
            >
              <IconCheck size={18} />
            </ActionIcon>
          )}
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => deleteMutation.mutate(notification.id)}
            loading={deleteMutation.isPending}
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1}>Notifications</Title>
          <Text c="dimmed">Stay updated with your tasks and activities</Text>
        </div>
        {unreadNotifications.length > 0 && (
          <Button
            leftSection={<IconCheck size={16} />}
            onClick={() => markAllAsReadMutation.mutate()}
            loading={markAllAsReadMutation.isPending}
          >
            Mark all as read
          </Button>
        )}
      </Group>

      <Tabs defaultValue="unread">
        <Tabs.List>
          <Tabs.Tab
            value="unread"
            leftSection={<IconBell size={16} />}
            rightSection={
              unreadNotifications.length > 0 && (
                <Badge size="sm" circle>
                  {unreadNotifications.length}
                </Badge>
              )
            }
          >
            Unread
          </Tabs.Tab>
          <Tabs.Tab value="all" leftSection={<IconBellOff size={16} />}>
            All Notifications
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="unread" pt="md">
          <Stack gap="sm">
            {isLoading ? (
              <Text>Loading notifications...</Text>
            ) : unreadNotifications.length === 0 ? (
              <Card shadow="sm" padding="xl" radius="md" withBorder>
                <Stack align="center" gap="md">
                  <Box style={{ fontSize: 64 }}>🎉</Box>
                  <Title order={3}>You're all caught up!</Title>
                  <Text c="dimmed" ta="center">
                    No new notifications. We'll let you know when something important happens.
                  </Text>
                </Stack>
              </Card>
            ) : (
              unreadNotifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="all" pt="md">
          <Stack gap="sm">
            {isLoading ? (
              <Text>Loading notifications...</Text>
            ) : notificationsData?.data?.length === 0 ? (
              <Card shadow="sm" padding="xl" radius="md" withBorder>
                <Stack align="center" gap="md">
                  <Box style={{ fontSize: 64 }}>📭</Box>
                  <Title order={3}>No notifications yet</Title>
                  <Text c="dimmed" ta="center">
                    When you receive notifications, they'll appear here.
                  </Text>
                </Stack>
              </Card>
            ) : (
              notificationsData.data.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

export default Notifications;
