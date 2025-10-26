import { useQuery } from '@tanstack/react-query';
import {
  Grid,
  Card,
  Text,
  Title,
  Group,
  RingProgress,
  Stack,
  Badge,
  SimpleGrid,
  Box,
  Table,
  Progress,
  Avatar,
} from '@mantine/core';
import {
  IconChecklist,
  IconCheckbox,
  IconAlertCircle,
  IconClock,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { dashboardAPI, taskAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between">
        <div>
          <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Title order={2} mt="xs">
            {value}
          </Title>
          {subtitle && (
            <Text c="dimmed" size="sm" mt={5}>
              {subtitle}
            </Text>
          )}
        </div>
        <Box
          style={{
            width: 60,
            height: 60,
            borderRadius: 60,
            backgroundColor: color + '20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={30} color={color} />
        </Box>
      </Group>
    </Card>
  );
}

function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canManageTasks = isAdmin || isManager;

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardAPI.getStats();
      return response.data.data;
    },
  });

  const { data: chartData } = useQuery({
    queryKey: ['dashboard-charts-completion'],
    queryFn: async () => {
      const response = await dashboardAPI.getChartData({ type: 'completion', days: 7 });
      return response.data.data;
    },
  });

  const { data: priorityData } = useQuery({
    queryKey: ['dashboard-charts-priority'],
    queryFn: async () => {
      const response = await dashboardAPI.getChartData({ type: 'priority' });
      return response.data.data;
    },
  });

  const { data: statusData } = useQuery({
    queryKey: ['dashboard-tasks-by-status'],
    queryFn: async () => {
      const response = await dashboardAPI.getTasksByStatus();
      return response.data.data;
    },
  });

  const { data: recentTasks } = useQuery({
    queryKey: ['dashboard-recent'],
    queryFn: async () => {
      const response = await taskAPI.getAll({ limit: 5, sort: 'created_at', order: 'desc' });
      return response.data.data;
    },
  });

  const PRIORITY_COLORS = {
    low: '#40C057',
    medium: '#FAB005',
    high: '#FD7E14',
    urgent: '#FA5252',
  };

  const STATUS_COLORS = {
    pending: '#868e96',
    in_progress: '#228be6',
    on_hold: '#fd7e14',
    completed: '#40c057',
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={1}>
          {getGreeting()}, {user?.full_name}!
        </Title>
        <Text c="dimmed">
          {canManageTasks
            ? "Here's your team's task overview"
            : "Here's your task overview"}
        </Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          icon={IconChecklist}
          color="#228BE6"
        />
        <StatCard
          title="Completed"
          value={stats?.completedTasks || 0}
          icon={IconCheckbox}
          color="#40C057"
          subtitle={`${stats?.completionRate || 0}% completion rate`}
        />
        <StatCard
          title="Overdue"
          value={stats?.overdueTasks || 0}
          icon={IconAlertCircle}
          color="#FA5252"
        />
        <StatCard
          title="Due Today"
          value={stats?.dueToday || 0}
          icon={IconClock}
          color="#FAB005"
        />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: canManageTasks ? 8 : 12 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">
              Task Completion Trend
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData || []}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => dayjs(value).format('MMM D')}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value) => dayjs(value).format('MMM D, YYYY')}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e9ecef',
                    borderRadius: 4,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#228BE6"
                  strokeWidth={3}
                  dot={{ fill: '#228BE6', r: 4 }}
                  name="Completed Tasks"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>

        {canManageTasks && (
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">
                Tasks by Priority
              </Title>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData || []}
                    dataKey="count"
                    nameKey="priority"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ priority, count }) => `${priority}: ${count}`}
                    labelLine={false}
                  >
                    {(priorityData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid.Col>
        )}
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, md: canManageTasks ? 7 : 8 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">
              Tasks by Status
            </Title>
            <Stack gap="md">
              {statusData?.map((item) => {
                const total = stats?.totalTasks || 1;
                const percentage = ((item.count / total) * 100).toFixed(1);
                return (
                  <div key={item.status}>
                    <Group justify="space-between" mb={5}>
                      <Group gap="xs">
                        <Badge color={STATUS_COLORS[item.status]} variant="dot">
                          {item.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Text size="sm" fw={500}>
                          {item.count} tasks
                        </Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        {percentage}%
                      </Text>
                    </Group>
                    <Progress
                      value={parseFloat(percentage)}
                      color={STATUS_COLORS[item.status]}
                      size="lg"
                    />
                  </div>
                );
              })}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: canManageTasks ? 5 : 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb="md">
              Quick Stats
            </Title>
            <Stack align="center" gap="xl">
              <RingProgress
                size={160}
                thickness={16}
                sections={[
                  {
                    value: stats?.completionRate || 0,
                    color: '#40C057',
                  },
                ]}
                label={
                  <Stack align="center" gap={0}>
                    <Text ta="center" fw={700} size="xl">
                      {stats?.completionRate || 0}%
                    </Text>
                    <Text ta="center" size="xs" c="dimmed">
                      Complete
                    </Text>
                  </Stack>
                }
              />
              <Stack gap="xs" style={{ width: '100%' }}>
                <Badge color="blue" variant="light" size="lg" fullWidth>
                  In Progress: {stats?.inProgress || 0}
                </Badge>
                <Badge color="yellow" variant="light" size="lg" fullWidth>
                  This Week: {stats?.dueThisWeek || 0}
                </Badge>
                {canManageTasks && (
                  <Badge color="grape" variant="light" size="lg" fullWidth>
                    <Group gap={4}>
                      <IconUsers size={14} />
                      Team Tasks: {stats?.totalTasks || 0}
                    </Group>
                  </Badge>
                )}
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>Recent Tasks</Title>
          <Text
            size="sm"
            c="blue"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/tasks')}
          >
            View All →
          </Text>
        </Group>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Task</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {recentTasks?.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                  <Text c="dimmed">No tasks yet</Text>
                </td>
              </tr>
            ) : (
              recentTasks?.map((task) => (
                <tr
                  key={task.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  <td>
                    <Text fw={500}>{task.title}</Text>
                  </td>
                  <td>
                    <Badge color={PRIORITY_COLORS[task.priority]} size="sm">
                      {task.priority}
                    </Badge>
                  </td>
                  <td>
                    <Badge color={STATUS_COLORS[task.status]} variant="dot" size="sm">
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td>
                    <Group gap="xs">
                      <Avatar size="sm" radius="xl">
                        {task.assigned_to_name?.charAt(0)}
                      </Avatar>
                      <Text size="sm">{task.assigned_to_name || 'Unassigned'}</Text>
                    </Group>
                  </td>
                  <td>
                    <Text size="sm" c={task.is_overdue ? 'red' : 'dimmed'}>
                      {task.due_date
                        ? dayjs(task.due_date).format('MMM D, YYYY')
                        : 'No due date'}
                    </Text>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {!canManageTasks && (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group>
            <Box
              style={{
                width: 50,
                height: 50,
                borderRadius: 50,
                backgroundColor: '#228be620',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconTrendingUp size={26} color="#228be6" />
            </Box>
            <div>
              <Text fw={600} size="lg">
                Keep up the great work!
              </Text>
              <Text c="dimmed" size="sm">
                You're making excellent progress on your tasks
              </Text>
            </div>
          </Group>
        </Card>
      )}
    </Stack>
  );
}

export default Dashboard;
