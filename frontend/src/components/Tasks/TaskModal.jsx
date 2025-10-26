import { useEffect } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Group,
  Tabs,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useQuery, useMutation } from '@tanstack/react-query';
import { taskAPI, categoryAPI, userAPI } from '../../services/api';

function TaskModal({ opened, onClose, task, onSuccess }) {
  const isEdit = !!task;

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      task_type: 'utility',
      priority: 'medium',
      status: 'not_started',
      category_id: '',
      assigned_to: '',
      due_date: null,
      start_date: null,
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoryAPI.getAll();
      return response.data.data;
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userAPI.getAll();
      return response.data.data;
    },
  });

  useEffect(() => {
    if (task) {
      form.setValues({
        title: task.title || '',
        description: task.description || '',
        task_type: task.task_type || 'utility',
        priority: task.priority || 'medium',
        status: task.status || 'not_started',
        category_id: task.category_id || '',
        assigned_to: task.assigned_to || '',
        due_date: task.due_date ? new Date(task.due_date) : null,
        start_date: task.start_date ? new Date(task.start_date) : null,
      });
    } else {
      form.reset();
    }
  }, [task]);

  const createMutation = useMutation({
    mutationFn: (data) => taskAPI.create(data),
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Task created successfully',
        color: 'green',
      });
      onSuccess();
      onClose();
      form.reset();
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to create task',
        color: 'red',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => taskAPI.update(id, data),
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Task updated successfully',
        color: 'green',
      });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.error || 'Failed to update task',
        color: 'red',
      });
    },
  });

  const handleSubmit = (values) => {
    if (isEdit) {
      updateMutation.mutate({ id: task.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Task' : 'Create New Task'}
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Tabs defaultValue="basic">
          <Tabs.List>
            <Tabs.Tab value="basic">Basic Info</Tabs.Tab>
            <Tabs.Tab value="details">Details</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="md">
            <Stack>
              <TextInput
                label="Title"
                placeholder="Enter task title"
                required
                {...form.getInputProps('title')}
              />

              <Textarea
                label="Description"
                placeholder="Enter task description"
                minRows={4}
                {...form.getInputProps('description')}
              />

              <Group grow>
                <Select
                  label="Task Type"
                  data={[
                    { value: 'file', label: 'File' },
                    { value: 'reminder', label: 'Reminder' },
                    { value: 'utility', label: 'Utility' },
                  ]}
                  {...form.getInputProps('task_type')}
                />

                <Select
                  label="Priority"
                  data={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' },
                  ]}
                  {...form.getInputProps('priority')}
                />
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="details" pt="md">
            <Stack>
              <Select
                label="Status"
                data={[
                  { value: 'not_started', label: 'Not Started' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'on_hold', label: 'On Hold' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                {...form.getInputProps('status')}
              />

              <Select
                label="Category"
                placeholder="Select category"
                data={
                  categoriesData?.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  })) || []
                }
                {...form.getInputProps('category_id')}
                clearable
              />

              <Select
                label="Assign To"
                placeholder="Select user to assign"
                data={
                  usersData?.map((user) => ({
                    value: user.id,
                    label: user.full_name + ' (' + user.email + ')',
                  })) || []
                }
                {...form.getInputProps('assigned_to')}
                clearable
                searchable
              />

              <DateTimePicker
                label="Start Date"
                placeholder="Pick start date"
                {...form.getInputProps('start_date')}
                clearable
              />

              <DateTimePicker
                label="Due Date"
                placeholder="Pick due date"
                {...form.getInputProps('due_date')}
                clearable
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {isEdit ? 'Update' : 'Create'} Task
          </Button>
        </Group>
      </form>
    </Modal>
  );
}

export default TaskModal;
