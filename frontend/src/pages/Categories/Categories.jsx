import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Stack,
  Title,
  Text,
  Card,
  Group,
  Button,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  ColorInput,
  Grid,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconFolder } from '@tabler/icons-react';
import { categoryAPI } from '../../services/api';

function Categories() {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      name: '',
      color: '#228BE6',
      icon: '📁',
    },
    validate: {
      name: (value) => (!value ? 'Category name is required' : null),
    },
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoryAPI.getAll();
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => categoryAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      notifications.show({
        title: 'Success',
        message: 'Category created successfully',
        color: 'green',
      });
      close();
      form.reset();
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to create category',
        color: 'red',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoryAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      notifications.show({
        title: 'Success',
        message: 'Category updated successfully',
        color: 'green',
      });
      close();
      form.reset();
      setSelectedCategory(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      notifications.show({
        title: 'Success',
        message: 'Category deleted successfully',
        color: 'green',
      });
    },
  });

  const handleOpenModal = (category = null) => {
    if (category) {
      setSelectedCategory(category);
      form.setValues({
        name: category.name,
        color: category.color,
        icon: category.icon || '📁',
      });
    } else {
      setSelectedCategory(null);
      form.reset();
    }
    open();
  };

  const handleSubmit = (values) => {
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const iconOptions = ['📁', '💼', '🏠', '💻', '📊', '🎯', '🚀', '⭐', '🔥', '💡', '📝', '🎨'];

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={1}>Categories</Title>
          <Text c="dimmed">Organize your tasks with custom categories</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
          Add Category
        </Button>
      </Group>

      {isLoading ? (
        <Text>Loading categories...</Text>
      ) : (
        <Grid>
          {categories?.map((category) => (
            <Grid.Col key={category.id} span={{ base: 12, sm: 6, md: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Group>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: category.color + '20',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                      }}
                    >
                      {category.icon || '📁'}
                    </div>
                    <div>
                      <Text fw={600} size="lg">
                        {category.name}
                      </Text>
                      <Badge
                        size="sm"
                        variant="dot"
                        color={category.color}
                        style={{ marginTop: 4 }}
                      >
                        {category.color}
                      </Badge>
                    </div>
                  </Group>
                </Group>

                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Created by: {category.created_by_name || 'Unknown'}
                  </Text>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => handleOpenModal(category)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => deleteMutation.mutate(category.id)}
                      loading={deleteMutation.isPending}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      <Modal
        opened={opened}
        onClose={close}
        title={selectedCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Category Name"
              placeholder="Enter category name"
              {...form.getInputProps('name')}
              required
            />

            <ColorInput
              label="Color"
              placeholder="Pick a color"
              {...form.getInputProps('color')}
            />

            <div>
              <Text size="sm" fw={500} mb="xs">
                Icon
              </Text>
              <Group>
                {iconOptions.map((icon) => (
                  <Button
                    key={icon}
                    variant={form.values.icon === icon ? 'filled' : 'subtle'}
                    size="lg"
                    onClick={() => form.setFieldValue('icon', icon)}
                    style={{ fontSize: 24, padding: '8px 12px' }}
                  >
                    {icon}
                  </Button>
                ))}
              </Group>
            </div>

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {selectedCategory ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}

export default Categories;
