import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Stack,
  Title,
  Text,
  Card,
  Group,
  Button,
  Table,
  Badge,
  ActionIcon,
  Menu,
  Avatar,
  Modal,
  TextInput,
  PasswordInput,
  Select,
  Pagination,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconDots,
  IconEdit,
  IconTrash,
  IconUserPlus,
  IconMail,
  IconUser,
} from '@tabler/icons-react';
import { userAPI, authAPI } from '../../services/api';
import dayjs from 'dayjs';

function Users() {
  const [page, setPage] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      full_name: '',
      password: '',
      role: 'user',
    },
    validate: {
      username: (value) =>
        value.length < 3 ? 'Username must be at least 3 characters' : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      full_name: (value) => (value.length < 2 ? 'Name is required' : null),
      password: (value) =>
        !selectedUser && value.length < 6
          ? 'Password must be at least 6 characters'
          : null,
    },
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: async () => {
      const response = await userAPI.getAll({ page, limit: 10 });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => authAPI.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      notifications.show({
        title: 'Success',
        message: 'User created successfully',
        color: 'green',
      });
      close();
      form.reset();
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to create user',
        color: 'red',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      notifications.show({
        title: 'Success',
        message: 'User updated successfully',
        color: 'green',
      });
      close();
      form.reset();
      setSelectedUser(null);
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to update user',
        color: 'red',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => userAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      notifications.show({
        title: 'Success',
        message: 'User deactivated successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || error.response?.data?.error || 'Failed to deactivate user',
        color: 'red',
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => userAPI.update(id, { is_active }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['users']);
      notifications.show({
        title: 'Success',
        message: `User ${variables.is_active ? 'activated' : 'deactivated'} successfully`,
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || error.response?.data?.error || 'Failed to update user status',
        color: 'red',
      });
    },
  });

  const handleOpenModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      form.setValues({
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        password: '',
      });
    } else {
      setSelectedUser(null);
      form.reset();
    }
    open();
  };

  const handleSubmit = (values) => {
    const data = { ...values };
    if (selectedUser) {
      if (!data.password) delete data.password;
      updateMutation.mutate({ id: selectedUser.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'red',
      manager: 'blue',
      user: 'green',
    };
    return colors[role] || 'gray';
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1}>Users Management</Title>
          <Text c="dimmed">Manage system users and their roles</Text>
        </div>
        <Button leftSection={<IconUserPlus size={16} />} onClick={() => handleOpenModal()}>
          Add User
        </Button>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>User</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                  Loading users...
                </Table.Td>
              </Table.Tr>
            ) : usersData?.data?.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                  No users found
                </Table.Td>
              </Table.Tr>
            ) : (
              usersData?.data?.map((user) => (
                <Table.Tr key={user.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar src={user.avatar_url} alt={user.full_name} radius="xl" size="sm">
                        {user.full_name?.charAt(0)}
                      </Avatar>
                      <div>
                        <Text fw={500} size="sm">
                          {user.full_name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          @{user.username}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <IconMail size={14} />
                      <Text size="sm">{user.email}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getRoleBadgeColor(user.role)} variant="light">
                      {user.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={user.is_active ? 'green' : 'red'} variant="dot">
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{dayjs(user.created_at).format('MMM D, YYYY')}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={() => handleOpenModal(user)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Divider />
                        {user.is_active ? (
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => toggleActiveMutation.mutate({ id: user.id, is_active: false })}
                          >
                            Deactivate
                          </Menu.Item>
                        ) : (
                          <Menu.Item
                            leftSection={<IconUser size={14} />}
                            color="green"
                            onClick={() => toggleActiveMutation.mutate({ id: user.id, is_active: true })}
                          >
                            Activate
                          </Menu.Item>
                        )}
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>

        {usersData?.pagination && usersData.pagination.pages > 1 && (
          <Group justify="center" mt="xl">
            <Pagination
              value={page}
              onChange={setPage}
              total={usersData.pagination.pages}
            />
          </Group>
        )}
      </Card>

      <Modal
        opened={opened}
        onClose={close}
        title={selectedUser ? 'Edit User' : 'Create New User'}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Full Name"
              placeholder="John Doe"
              leftSection={<IconUser size={16} />}
              required
              {...form.getInputProps('full_name')}
            />

            <TextInput
              label="Username"
              placeholder="johndoe"
              leftSection={<IconUser size={16} />}
              required
              {...form.getInputProps('username')}
            />

            <TextInput
              label="Email"
              placeholder="john@example.com"
              leftSection={<IconMail size={16} />}
              required
              {...form.getInputProps('email')}
            />

            <Select
              label="Role"
              data={[
                { value: 'user', label: 'User' },
                { value: 'manager', label: 'Manager' },
                { value: 'admin', label: 'Admin' },
              ]}
              required
              {...form.getInputProps('role')}
            />

            <PasswordInput
              label={selectedUser ? 'New Password (leave empty to keep current)' : 'Password'}
              placeholder="Enter password"
              required={!selectedUser}
              {...form.getInputProps('password')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {selectedUser ? 'Update' : 'Create'} User
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}

export default Users;
