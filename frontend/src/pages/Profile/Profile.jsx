import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Stack,
  Title,
  Text,
  Card,
  Group,
  Avatar,
  Button,
  TextInput,
  PasswordInput,
  Badge,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconKey } from '@tabler/icons-react';
import { useAuthStore } from '../../store/authStore';
import { userAPI } from '../../services/api';

function Profile() {
  const { user, updateUser } = useAuthStore();
  const [editMode, setEditMode] = useState(false);

  const profileForm = useForm({
    initialValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      username: user?.username || '',
    },
  });

  const passwordForm = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (value) => (!value ? 'Current password is required' : null),
      newPassword: (value) =>
        value.length < 6 ? 'Password must be at least 6 characters' : null,
      confirmPassword: (value, values) =>
        value !== values.newPassword ? 'Passwords do not match' : null,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => userAPI.update(user.id, data),
    onSuccess: (response) => {
      updateUser(response.data.data);
      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
      });
      setEditMode(false);
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile',
        color: 'red',
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data) => userAPI.changePassword(data),
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Password changed successfully',
        color: 'green',
      });
      passwordForm.reset();
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to change password',
        color: 'red',
      });
    },
  });

  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>Profile</Title>
        <Text c="dimmed">Manage your account information</Text>
      </div>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group mb="xl">
          <Avatar
            src={user?.avatar_url}
            alt={user?.full_name}
            size={80}
            radius="xl"
          >
            {user?.full_name?.charAt(0)}
          </Avatar>
          <div>
            <Title order={2}>{user?.full_name}</Title>
            <Text c="dimmed">{user?.email}</Text>
            <Badge color={user?.role === 'admin' ? 'red' : 'blue'} mt={5}>
              {user?.role}
            </Badge>
          </div>
        </Group>

        <Divider mb="md" />

        <form onSubmit={profileForm.onSubmit((values) => updateProfileMutation.mutate(values))}>
          <Stack gap="md">
            <TextInput
              label="Full Name"
              placeholder="Your full name"
              {...profileForm.getInputProps('full_name')}
              disabled={!editMode}
            />

            <TextInput
              label="Username"
              placeholder="Your username"
              {...profileForm.getInputProps('username')}
              disabled={!editMode}
            />

            <TextInput
              label="Email"
              placeholder="your@email.com"
              {...profileForm.getInputProps('email')}
              disabled={!editMode}
            />

            <Group justify="flex-end" mt="md">
              {!editMode ? (
                <Button
                  leftSection={<IconEdit size={16} />}
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button variant="subtle" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={updateProfileMutation.isPending}>
                    Save Changes
                  </Button>
                </>
              )}
            </Group>
          </Stack>
        </form>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Change Password
        </Title>

        <form onSubmit={passwordForm.onSubmit((values) => changePasswordMutation.mutate(values))}>
          <Stack gap="md">
            <PasswordInput
              label="Current Password"
              placeholder="Enter current password"
              {...passwordForm.getInputProps('currentPassword')}
            />

            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              {...passwordForm.getInputProps('newPassword')}
            />

            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm new password"
              {...passwordForm.getInputProps('confirmPassword')}
            />

            <Group justify="flex-end">
              <Button
                type="submit"
                leftSection={<IconKey size={16} />}
                loading={changePasswordMutation.isPending}
              >
                Change Password
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Title order={3} mb="md">
          Account Information
        </Title>

        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Account Created
            </Text>
            <Text size="sm" fw={500}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Last Login
            </Text>
            <Text size="sm" fw={500}>
              {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A'}
            </Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Account Status
            </Text>
            <Badge color="green">Active</Badge>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}

export default Profile;
