import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Stack,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  Badge,
  Card,
  Text,
  ActionIcon,
  Menu,
  Pagination,
  Drawer,
  MultiSelect,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { taskAPI, categoryAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import TaskModal from '../../components/Tasks/TaskModal';
import dayjs from 'dayjs';

function TaskList() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category_id: '',
    search: '',
  });
  const [filterDrawerOpened, { open: openFilterDrawer, close: closeFilterDrawer }] =
    useDisclosure(false);
  const [taskModalOpened, { open: openTaskModal, close: closeTaskModal }] = useDisclosure(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const canManageTasks = user?.role === 'admin' || user?.role === 'manager';

  const { data: tasksData, refetch } = useQuery({
    queryKey: ['tasks', page, filters],
    queryFn: async () => {
      const response = await taskAPI.getAll({ page, limit: 10, ...filters });
      return response.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoryAPI.getAll();
      return response.data.data;
    },
  });

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      urgent: 'red',
    };
    return colors[priority] || 'gray';
  };

  const getStatusColor = (status) => {
    const colors = {
      not_started: 'gray',
      in_progress: 'blue',
      on_hold: 'orange',
      completed: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'gray';
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    openTaskModal();
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    openTaskModal();
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1}>Tasks</Title>
          <Text c="dimmed">{canManageTasks ? 'Manage and organize your tasks' : 'View and update your assigned tasks'}</Text>
        </div>
        {canManageTasks && (
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreateTask}>
            Add Task
          </Button>
        )}
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group mb="md">
          <TextInput
            placeholder="Search tasks..."
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1 }}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            placeholder="Status"
            data={[
              { value: '', label: 'All Status' },
              { value: 'not_started', label: 'Not Started' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'on_hold', label: 'On Hold' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            clearable
            style={{ width: 150 }}
          />
          <Select
            placeholder="Priority"
            data={[
              { value: '', label: 'All Priority' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
            value={filters.priority}
            onChange={(value) => setFilters({ ...filters, priority: value })}
            clearable
            style={{ width: 150 }}
          />
          <ActionIcon variant="subtle" onClick={openFilterDrawer}>
            <IconFilter size={20} />
          </ActionIcon>
        </Group>

        <Stack gap="sm">
          {tasksData?.data?.map((task) => (
            <Card key={task.id} shadow="xs" padding="md" withBorder>
              <Group justify="space-between" align="flex-start">
                <div style={{ flex: 1 }}>
                  <Group gap="sm" mb="xs">
                    <Text fw={600} size="lg">
                      {task.title}
                    </Text>
                    <Badge color={getPriorityColor(task.priority)} size="sm">
                      {task.priority}
                    </Badge>
                    <Badge color={getStatusColor(task.status)} size="sm">
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </Group>

                  {task.description && (
                    <Text c="dimmed" size="sm" lineClamp={2} mb="xs">
                      {task.description.replace(/<[^>]*>/g, '')}
                    </Text>
                  )}

                  <Group gap="md">
                    {task.assigned_to_name && (
                      <Text size="sm" c="dimmed">
                        👤 {task.assigned_to_name}
                      </Text>
                    )}
                    {task.due_date && (
                      <Text size="sm" c="dimmed">
                        📅 Due: {dayjs(task.due_date).format('MMM D, YYYY')}
                      </Text>
                    )}
                    {task.category_name && (
                      <Badge
                        size="sm"
                        variant="dot"
                        color={task.category_color}
                      >
                        {task.category_name}
                      </Badge>
                    )}
                  </Group>
                </div>

                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <ActionIcon variant="subtle">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconEye size={14} />}
                      onClick={() => handleEditTask(task)}
                    >
                      View
                    </Menu.Item>
                    {canManageTasks && (
                      <>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={() => handleEditTask(task)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                        >
                          Delete
                        </Menu.Item>
                      </>
                    )}
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Card>
          ))}
        </Stack>

        {tasksData?.pagination && (
          <Group justify="center" mt="xl">
            <Pagination
              value={page}
              onChange={setPage}
              total={tasksData.pagination.pages}
            />
          </Group>
        )}
      </Card>

      <TaskModal
        opened={taskModalOpened}
        onClose={closeTaskModal}
        task={selectedTask}
        onSuccess={refetch}
      />

      <Drawer
        opened={filterDrawerOpened}
        onClose={closeFilterDrawer}
        title="Advanced Filters"
        position="right"
      >
        <Stack>
          <Select
            label="Category"
            placeholder="Select category"
            data={
              categoriesData?.map((cat) => ({
                value: cat.id,
                label: cat.name,
              })) || []
            }
            value={filters.category_id}
            onChange={(value) => setFilters({ ...filters, category_id: value })}
            clearable
          />
          <Button onClick={closeFilterDrawer}>Apply Filters</Button>
        </Stack>
      </Drawer>
    </Stack>
  );
}

export default TaskList;
