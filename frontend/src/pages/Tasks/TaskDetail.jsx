import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Paper,
  Title,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  Select,
  Textarea,
  Loader,
  Alert,
  Divider,
} from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { taskAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

const priorityColors = {
  low: 'blue',
  medium: 'yellow',
  high: 'orange',
  urgent: 'red',
};

const statusColors = {
  pending: 'gray',
  in_progress: 'blue',
  on_hold: 'orange',
  completed: 'green',
};

function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await taskAPI.getById(taskId);
      return response.data.data;
    },
  });

  useEffect(() => {
    if (task) {
      setStatus(task.status);
    }
  }, [task]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await taskAPI.update(taskId, data);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Task updated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      queryClient.invalidateQueries(['task', taskId]);
      queryClient.invalidateQueries(['tasks']);
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update task',
        color: 'red',
      });
    },
  });

  const handleUpdateStatus = () => {
    if (status === task.status && !notes) {
      notifications.show({
        title: 'No Changes',
        message: 'Please change the status or add notes',
        color: 'yellow',
      });
      return;
    }

    const updateData = {};
    if (status !== task.status) {
      updateData.status = status;
    }
    if (notes) {
      updateData.notes = notes;
    }

    updateMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Stack align="center" mt={50}>
          <Loader size="lg" />
          <Text>Loading task details...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error.response?.data?.message || 'Failed to load task details'}
        </Alert>
        <Button
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/tasks')}
          mt="md"
        >
          Back to Tasks
        </Button>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Not Found" color="yellow">
          Task not found
        </Alert>
        <Button
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/tasks')}
          mt="md"
        >
          Back to Tasks
        </Button>
      </Container>
    );
  }

  const isAssignedToUser = task.assigned_to === user?.id;
  const canUpdateStatus = isAssignedToUser || user?.role === 'admin';

  return (
    <Container size="md" py="xl">
      <Stack gap="md">
        <Button
          leftSection={<IconArrowLeft size={16} />}
          variant="subtle"
          onClick={() => navigate('/tasks')}
        >
          Back to Tasks
        </Button>

        <Paper p="xl" shadow="sm" radius="md">
          <Stack gap="lg">
            <div>
              <Group justify="apart" mb="xs">
                <Title order={2}>{task.title}</Title>
                <Badge color={statusColors[task.status]} size="lg">
                  {task.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </Group>
              <Group gap="xs">
                <Badge color={priorityColors[task.priority]}>
                  {task.priority.toUpperCase()}
                </Badge>
                {task.category_name && (
                  <Badge variant="outline">{task.category_name}</Badge>
                )}
              </Group>
            </div>

            <Divider />

            <Stack gap="sm">
              <Text fw={500}>Description</Text>
              <Text c="dimmed">{task.description || 'No description'}</Text>
            </Stack>

            <Group grow>
              <Stack gap="xs">
                <Text fw={500} size="sm">Assigned To</Text>
                <Text c="dimmed">{task.assigned_to_name || 'Unassigned'}</Text>
              </Stack>
              <Stack gap="xs">
                <Text fw={500} size="sm">Created By</Text>
                <Text c="dimmed">{task.created_by_name}</Text>
              </Stack>
            </Group>

            <Group grow>
              <Stack gap="xs">
                <Text fw={500} size="sm">Due Date</Text>
                <Text c="dimmed">
                  {task.due_date ? dayjs(task.due_date).format('MMM DD, YYYY HH:mm') : 'Not set'}
                </Text>
              </Stack>
              <Stack gap="xs">
                <Text fw={500} size="sm">Created At</Text>
                <Text c="dimmed">{dayjs(task.created_at).format('MMM DD, YYYY HH:mm')}</Text>
              </Stack>
            </Group>

            {canUpdateStatus && (
              <>
                <Divider />
                <Stack gap="md">
                  <Title order={4}>Update Task</Title>
                  <Select
                    label="Status"
                    value={status}
                    onChange={setStatus}
                    data={statusOptions}
                    placeholder="Select status"
                  />
                  <Textarea
                    label="Notes (Optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this update..."
                    minRows={3}
                  />
                  <Button
                    onClick={handleUpdateStatus}
                    loading={updateMutation.isPending}
                    leftSection={<IconCheck size={16} />}
                  >
                    Update Task
                  </Button>
                </Stack>
              </>
            )}

            {!canUpdateStatus && (
              <Alert color="blue" title="View Only">
                You can view this task but cannot update it. Only the assigned user or admin can update the task status.
              </Alert>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}

export default TaskDetail;
