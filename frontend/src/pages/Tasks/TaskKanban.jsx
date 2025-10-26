import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Stack, Title, Text, Grid, Card, Badge, Group, Paper, Modal } from '@mantine/core';
import { taskAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

const priorityColors = {
  low: 'blue',
  medium: 'yellow',
  high: 'orange',
  urgent: 'red',
};

const statusOptions = [
  { id: 'pending', title: 'Pending', color: 'gray' },
  { id: 'in_progress', title: 'In Progress', color: 'blue' },
  { id: 'on_hold', title: 'On Hold', color: 'orange' },
  { id: 'completed', title: 'Completed', color: 'green' },
];

function TaskKanban() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [draggedTask, setDraggedTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);

  const { data: tasksData, refetch } = useQuery({
    queryKey: ['tasks-kanban'],
    queryFn: async () => {
      const response = await taskAPI.getAll({ limit: 1000 });
      return response.data.data;
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }) => {
      return await taskAPI.update(taskId, { status });
    },
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Task status updated',
        color: 'green',
      });
      queryClient.invalidateQueries(['tasks-kanban']);
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

  const tasks = tasksData || [];

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status) || [];
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    
    if (!draggedTask) return;

    const canUpdate =
      user?.role === 'admin' ||
      user?.role === 'manager' ||
      draggedTask.assigned_to === user?.id;

    if (!canUpdate) {
      notifications.show({
        title: 'Permission Denied',
        message: 'You can only update tasks assigned to you',
        color: 'red',
      });
      setDraggedTask(null);
      return;
    }

    if (draggedTask.status !== newStatus) {
      updateTaskMutation.mutate({
        taskId: draggedTask.id,
        status: newStatus,
      });
    }

    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>Kanban Board</Title>
        <Text c="dimmed">Drag and drop tasks to update their status</Text>
      </div>

      <Grid gutter="md">
        {statusOptions.map((column) => (
          <Grid.Col key={column.id} span={{ base: 12, sm: 6, md: 3 }}>
            <Card
              shadow="sm"
              padding="md"
              radius="md"
              withBorder
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
              style={{
                minHeight: 500,
                backgroundColor:
                  draggedTask && draggedTask.status !== column.id
                    ? 'var(--mantine-color-gray-0)'
                    : undefined,
              }}
            >
              <Group justify="space-between" mb="md">
                <Text fw={600}>{column.title}</Text>
                <Badge color={column.color}>{getTasksByStatus(column.id).length}</Badge>
              </Group>

              <Stack gap="sm">
                {getTasksByStatus(column.id).map((task) => (
                  <Paper
                    key={task.id}
                    shadow="xs"
                    padding="sm"
                    withBorder
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      setSelectedTask(task);
                      setModalOpened(true);
                    }}
                    style={{
                      cursor: 'grab',
                      opacity: draggedTask?.id === task.id ? 0.5 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <Group justify="apart" mb="xs">
                      <Badge color={priorityColors[task.priority]} size="xs">
                        {task.priority}
                      </Badge>
                      {task.category_name && (
                        <Badge size="xs" variant="dot" color={task.category_color}>
                          {task.category_name}
                        </Badge>
                      )}
                    </Group>

                    <Text fw={500} size="sm" mb="xs">
                      {task.title}
                    </Text>

                    {task.description && (
                      <Text size="xs" c="dimmed" lineClamp={2} mb="xs">
                        {task.description.replace(/<[^>]*>/g, '')}
                      </Text>
                    )}

                    <Group gap="xs" mt="xs">
                      {task.assigned_to_name && (
                        <Text size="xs" c="dimmed">
                          👤 {task.assigned_to_name}
                        </Text>
                      )}
                      {task.due_date && (
                        <Text size="xs" c="dimmed">
                          📅 {dayjs(task.due_date).format('MMM D')}
                        </Text>
                      )}
                    </Group>
                  </Paper>
                ))}

                {getTasksByStatus(column.id).length === 0 && (
                  <Text c="dimmed" size="sm" ta="center" mt="xl">
                    No tasks
                  </Text>
                )}
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={selectedTask?.title}
        size="lg"
      >
        {selectedTask && (
          <Stack gap="md">
            <Group>
              <Badge color={priorityColors[selectedTask.priority]}>
                {selectedTask.priority.toUpperCase()}
              </Badge>
              <Badge color={statusOptions.find((s) => s.id === selectedTask.status)?.color}>
                {selectedTask.status.replace('_', ' ').toUpperCase()}
              </Badge>
              {selectedTask.category_name && (
                <Badge variant="outline" color={selectedTask.category_color}>
                  {selectedTask.category_name}
                </Badge>
              )}
            </Group>

            {selectedTask.description && (
              <div>
                <Text fw={500} mb="xs">
                  Description
                </Text>
                <Text c="dimmed" dangerouslySetInnerHTML={{ __html: selectedTask.description }} />
              </div>
            )}

            <Group grow>
              <div>
                <Text fw={500} size="sm" mb="xs">
                  Assigned To
                </Text>
                <Text c="dimmed">{selectedTask.assigned_to_name || 'Unassigned'}</Text>
              </div>
              <div>
                <Text fw={500} size="sm" mb="xs">
                  Due Date
                </Text>
                <Text c="dimmed">
                  {selectedTask.due_date
                    ? dayjs(selectedTask.due_date).format('MMM DD, YYYY HH:mm')
                    : 'Not set'}
                </Text>
              </div>
            </Group>

            <div>
              <Text fw={500} size="sm" mb="xs">
                Created By
              </Text>
              <Text c="dimmed">{selectedTask.created_by_name}</Text>
            </div>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

export default TaskKanban;
