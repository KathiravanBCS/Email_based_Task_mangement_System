import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Stack,
  Title,
  Text,
  Card,
  Badge,
  Group,
  Paper,
  Modal,
  Button,
  SegmentedControl,
  Table,
  Box,
  Grid,
  ActionIcon,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
} from '@tabler/icons-react';
import { taskAPI } from '../../services/api';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const priorityColors = {
  low: '#228be6',
  medium: '#fab005',
  high: '#fd7e14',
  urgent: '#fa5252',
};

const statusColors = {
  pending: 'gray',
  in_progress: 'blue',
  on_hold: 'orange',
  completed: 'green',
};

function TaskCalendar() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [view, setView] = useState('Month');
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);

  const { data: tasksData } = useQuery({
    queryKey: ['tasks-calendar'],
    queryFn: async () => {
      const response = await taskAPI.getAll({ limit: 1000 });
      return response.data.data;
    },
  });

  const tasks = tasksData || [];

  const getTasksForDate = (date) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = dayjs(task.due_date);
      return taskDate.isSame(dayjs(date), 'day');
    });
  };

  const getTasksForWeek = () => {
    const startOfWeek = currentDate.startOf('week');
    const endOfWeek = currentDate.endOf('week');
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = dayjs(task.due_date);
      return taskDate.isSameOrAfter(startOfWeek, 'day') && taskDate.isSameOrBefore(endOfWeek, 'day');
    });
  };

  const getTasksForAgenda = () => {
    return tasks
      .filter((task) => task.due_date)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 20);
  };

  const handlePrevious = () => {
    if (view === 'Month') {
      setCurrentDate(currentDate.subtract(1, 'month'));
    } else if (view === 'Week') {
      setCurrentDate(currentDate.subtract(1, 'week'));
    } else if (view === 'Day') {
      setCurrentDate(currentDate.subtract(1, 'day'));
    }
  };

  const handleNext = () => {
    if (view === 'Month') {
      setCurrentDate(currentDate.add(1, 'month'));
    } else if (view === 'Week') {
      setCurrentDate(currentDate.add(1, 'week'));
    } else if (view === 'Day') {
      setCurrentDate(currentDate.add(1, 'day'));
    }
  };

  const handleToday = () => {
    setCurrentDate(dayjs());
  };

  const renderMonthView = () => {
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startDate = startOfMonth.startOf('week');
    const endDate = endOfMonth.endOf('week');

    const weeks = [];
    let currentWeekStart = startDate;

    while (currentWeekStart.isBefore(endDate)) {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = currentWeekStart.add(i, 'day');
        const dayTasks = getTasksForDate(day);
        const isCurrentMonth = day.isSame(currentDate, 'month');

        days.push(
          <td
            key={day.format('YYYY-MM-DD')}
            style={{
              border: '1px solid #dee2e6',
              padding: '8px',
              verticalAlign: 'top',
              backgroundColor: isCurrentMonth ? '#fff' : '#f8f9fa',
              minHeight: 120,
              width: '14.28%',
            }}
          >
            <Text
              size="sm"
              fw={day.isSame(dayjs(), 'day') ? 700 : 400}
              c={!isCurrentMonth ? 'dimmed' : undefined}
              mb="xs"
            >
              {day.format('D')}
            </Text>
            <Stack gap={4}>
              {dayTasks.slice(0, 3).map((task) => (
                <Paper
                  key={task.id}
                  p={6}
                  style={{
                    backgroundColor: priorityColors[task.priority],
                    cursor: 'pointer',
                    borderRadius: 4,
                  }}
                  onClick={() => {
                    setSelectedTask(task);
                    setModalOpened(true);
                  }}
                >
                  <Text size="xs" c="white" lineClamp={1} fw={500}>
                    {task.title}
                  </Text>
                  <Text size="xs" c="white" opacity={0.8}>
                    {task.assigned_to_name}
                  </Text>
                </Paper>
              ))}
              {dayTasks.length > 3 && (
                <Text size="xs" c="dimmed">
                  +{dayTasks.length - 3} more
                </Text>
              )}
            </Stack>
          </td>
        );
      }
      weeks.push(<tr key={currentWeekStart.format('YYYY-MM-DD')}>{days}</tr>);
      currentWeekStart = currentWeekStart.add(1, 'week');
    }

    return (
      <Card shadow="sm" padding={0} radius="md" withBorder>
        <Table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
          }}
        >
          <thead>
            <tr>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <th
                  key={day}
                  style={{
                    border: '1px solid #dee2e6',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                    fontWeight: 600,
                  }}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{weeks}</tbody>
        </Table>
      </Card>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = currentDate.startOf('week');
    const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <Card shadow="sm" padding={0} radius="md" withBorder style={{ overflowX: 'auto' }}>
        <Table style={{ borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #dee2e6', padding: '12px', width: 80 }}></th>
              {days.map((day) => (
                <th
                  key={day.format('YYYY-MM-DD')}
                  style={{
                    border: '1px solid #dee2e6',
                    padding: '12px',
                    backgroundColor: '#f8f9fa',
                  }}
                >
                  <Text size="sm" fw={500}>
                    {day.format('ddd')}
                  </Text>
                  <Text size="lg" fw={700}>
                    {day.format('D')}
                  </Text>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <td
                  style={{
                    border: '1px solid #dee2e6',
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                  }}
                >
                  <Text size="xs" c="dimmed">
                    {dayjs().hour(hour).format('h A')}
                  </Text>
                </td>
                {days.map((day) => {
                  const dayTasks = getTasksForDate(day).filter((task) => {
                    const taskHour = dayjs(task.due_date).hour();
                    return taskHour === hour;
                  });

                  return (
                    <td
                      key={day.format('YYYY-MM-DD')}
                      style={{
                        border: '1px solid #dee2e6',
                        padding: '4px',
                        minHeight: 60,
                        position: 'relative',
                      }}
                    >
                      {dayTasks.map((task) => (
                        <Paper
                          key={task.id}
                          p={8}
                          mb={4}
                          style={{
                            backgroundColor: priorityColors[task.priority],
                            cursor: 'pointer',
                            borderRadius: 4,
                          }}
                          onClick={() => {
                            setSelectedTask(task);
                            setModalOpened(true);
                          }}
                        >
                          <Text size="xs" c="white" fw={500} lineClamp={1}>
                            {task.title}
                          </Text>
                          <Text size="xs" c="white" opacity={0.8}>
                            {dayjs(task.due_date).format('h:mm A')}
                          </Text>
                        </Paper>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayTasks = getTasksForDate(currentDate);

    return (
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Stack gap="xs">
          {hours.map((hour) => {
            const hourTasks = dayTasks.filter((task) => {
              const taskHour = dayjs(task.due_date).hour();
              return taskHour === hour;
            });

            return (
              <Group key={hour} align="flex-start" gap="md">
                <Text size="sm" c="dimmed" style={{ width: 80 }}>
                  {dayjs().hour(hour).format('h:mm A')}
                </Text>
                <Box style={{ flex: 1, minHeight: 40, borderLeft: '2px solid #e9ecef', paddingLeft: 12 }}>
                  {hourTasks.map((task) => (
                    <Paper
                      key={task.id}
                      p="md"
                      mb="xs"
                      style={{
                        backgroundColor: priorityColors[task.priority],
                        cursor: 'pointer',
                        borderRadius: 4,
                      }}
                      onClick={() => {
                        setSelectedTask(task);
                        setModalOpened(true);
                      }}
                    >
                      <Text c="white" fw={600} mb={4}>
                        {task.title}
                      </Text>
                      <Text size="sm" c="white" opacity={0.9}>
                        {dayjs(task.due_date).format('h:mm A')} - Assigned to: {task.assigned_to_name}
                      </Text>
                    </Paper>
                  ))}
                </Box>
              </Group>
            );
          })}
        </Stack>
      </Card>
    );
  };

  const renderAgendaView = () => {
    const agendaTasks = getTasksForAgenda();

    return (
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Event</th>
            </tr>
          </thead>
          <tbody>
            {agendaTasks.map((task) => (
              <tr
                key={task.id}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSelectedTask(task);
                  setModalOpened(true);
                }}
              >
                <td>
                  <Text fw={500}>{dayjs(task.due_date).format('ddd MMM D')}</Text>
                </td>
                <td>
                  <Text size="sm" c="dimmed">
                    {dayjs(task.due_date).format('h:mm A')}
                  </Text>
                </td>
                <td>
                  <div>
                    <Group gap="xs" mb={4}>
                      <Text fw={600}>{task.title}</Text>
                      <Badge color={priorityColors[task.priority]} size="sm">
                        {task.priority}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed">
                      Assigned to: {task.assigned_to_name}
                    </Text>
                    {task.category_name && (
                      <Badge size="xs" variant="dot" color={task.category_color} mt={4}>
                        {task.category_name}
                      </Badge>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {agendaTasks.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: 40 }}>
                  <Text c="dimmed">No upcoming tasks</Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    );
  };

  const getTitle = () => {
    if (view === 'Month') {
      return currentDate.format('MMMM YYYY');
    } else if (view === 'Week') {
      const start = currentDate.startOf('week');
      const end = currentDate.endOf('week');
      return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
    } else if (view === 'Day') {
      return currentDate.format('MMMM D, YYYY');
    } else {
      return 'Upcoming Tasks';
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Group>
          <Button
            variant="default"
            leftSection={<IconChevronLeft size={16} />}
            onClick={handlePrevious}
          >
            Previous
          </Button>
          <Button variant="default" onClick={handleToday}>
            Today
          </Button>
          <Button
            variant="default"
            rightSection={<IconChevronRight size={16} />}
            onClick={handleNext}
          >
            Next
          </Button>
          <Title order={2}>{getTitle()}</Title>
        </Group>

        <SegmentedControl
          value={view}
          onChange={setView}
          data={[
            { label: 'Month', value: 'Month' },
            { label: 'Week', value: 'Week' },
            { label: 'Day', value: 'Day' },
            { label: 'Agenda', value: 'Agenda' },
          ]}
        />
      </Group>

      {view === 'Month' && renderMonthView()}
      {view === 'Week' && renderWeekView()}
      {view === 'Day' && renderDayView()}
      {view === 'Agenda' && renderAgendaView()}

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
              <Badge color={statusColors[selectedTask.status]}>
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
                  {dayjs(selectedTask.due_date).format('MMM DD, YYYY HH:mm')}
                </Text>
              </div>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

export default TaskCalendar;
