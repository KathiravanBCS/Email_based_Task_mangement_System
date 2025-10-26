import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Stack,
  Title,
  Text,
  Card,
  Switch,
  Button,
  Group,
  Select,
  Divider,
  SegmentedControl,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { userAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useMantineColorScheme } from '@mantine/core';

function Settings() {
  const { user, updateUser } = useAuthStore();
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const { data: userSettings } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      const response = await userAPI.getById(user.id);
      return response.data.data;
    },
    enabled: !!user?.id,
  });

  const [emailNotifications, setEmailNotifications] = useState({
    task_assignment: true,
    due_date_reminder: true,
    status_update: true,
    comments: true,
    daily_digest: true,
    weekly_summary: true,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => userAPI.updateSettings(user.id, data),
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Settings updated successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update settings',
        color: 'red',
      });
    },
  });

  const handleNotificationToggle = (key) => {
    const newSettings = {
      ...emailNotifications,
      [key]: !emailNotifications[key],
    };
    setEmailNotifications(newSettings);
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      theme: colorScheme,
      email_notifications: emailNotifications,
      timezone: 'UTC',
      language: 'en',
    });
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>Settings</Title>
        <Text c="dimmed">Manage your account preferences and notifications</Text>
      </div>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Appearance
        </Title>

        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} mb="xs">
              Theme
            </Text>
            <SegmentedControl
              value={colorScheme}
              onChange={setColorScheme}
              data={[
                { label: '☀️ Light', value: 'light' },
                { label: '🌙 Dark', value: 'dark' },
                { label: '💻 Auto', value: 'auto' },
              ]}
            />
          </div>
        </Stack>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Email Notifications
        </Title>
        <Text size="sm" c="dimmed" mb="md">
          Choose which email notifications you want to receive
        </Text>

        <Stack gap="md">
          <Group justify="space-between">
            <div>
              <Text size="sm" fw={500}>
                Task Assignment
              </Text>
              <Text size="xs" c="dimmed">
                Get notified when a task is assigned to you
              </Text>
            </div>
            <Switch
              checked={emailNotifications.task_assignment}
              onChange={() => handleNotificationToggle('task_assignment')}
            />
          </Group>

          <Divider />

          <Group justify="space-between">
            <div>
              <Text size="sm" fw={500}>
                Due Date Reminders
              </Text>
              <Text size="xs" c="dimmed">
                Receive reminders before tasks are due
              </Text>
            </div>
            <Switch
              checked={emailNotifications.due_date_reminder}
              onChange={() => handleNotificationToggle('due_date_reminder')}
            />
          </Group>

          <Divider />

          <Group justify="space-between">
            <div>
              <Text size="sm" fw={500}>
                Status Updates
              </Text>
              <Text size="xs" c="dimmed">
                Get notified when task status changes
              </Text>
            </div>
            <Switch
              checked={emailNotifications.status_update}
              onChange={() => handleNotificationToggle('status_update')}
            />
          </Group>

          <Divider />

          <Group justify="space-between">
            <div>
              <Text size="sm" fw={500}>
                Comments
              </Text>
              <Text size="xs" c="dimmed">
                Receive notifications for new comments on your tasks
              </Text>
            </div>
            <Switch
              checked={emailNotifications.comments}
              onChange={() => handleNotificationToggle('comments')}
            />
          </Group>

          <Divider />

          <Group justify="space-between">
            <div>
              <Text size="sm" fw={500}>
                Daily Digest
              </Text>
              <Text size="xs" c="dimmed">
                Get a daily summary of your tasks
              </Text>
            </div>
            <Switch
              checked={emailNotifications.daily_digest}
              onChange={() => handleNotificationToggle('daily_digest')}
            />
          </Group>

          <Divider />

          <Group justify="space-between">
            <div>
              <Text size="sm" fw={500}>
                Weekly Summary
              </Text>
              <Text size="xs" c="dimmed">
                Receive a weekly report of completed tasks
              </Text>
            </div>
            <Switch
              checked={emailNotifications.weekly_summary}
              onChange={() => handleNotificationToggle('weekly_summary')}
            />
          </Group>
        </Stack>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Regional Settings
        </Title>

        <Stack gap="md">
          <Select
            label="Timezone"
            placeholder="Select timezone"
            data={[
              { value: 'UTC', label: 'UTC' },
              { value: 'America/New_York', label: 'Eastern Time' },
              { value: 'America/Chicago', label: 'Central Time' },
              { value: 'America/Los_Angeles', label: 'Pacific Time' },
              { value: 'Europe/London', label: 'London' },
              { value: 'Asia/Kolkata', label: 'India' },
            ]}
            defaultValue="UTC"
          />

          <Select
            label="Language"
            placeholder="Select language"
            data={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Spanish' },
              { value: 'fr', label: 'French' },
              { value: 'de', label: 'German' },
            ]}
            defaultValue="en"
          />
        </Stack>
      </Card>

      <Group justify="flex-end">
        <Button
          onClick={handleSaveSettings}
          loading={updateSettingsMutation.isPending}
        >
          Save Settings
        </Button>
      </Group>
    </Stack>
  );
}

export default Settings;
