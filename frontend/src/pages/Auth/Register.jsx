import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Anchor,
  Stack,
  Progress,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      full_name: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      username: (value) =>
        value.length >= 3 ? null : 'Username must be at least 3 characters',
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      full_name: (value) => (value.length >= 2 ? null : 'Name is required'),
      password: (value) =>
        value.length >= 6 ? null : 'Password must be at least 6 characters',
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords do not match',
    },
  });

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.register({
        username: values.username,
        email: values.email,
        full_name: values.full_name,
        password: values.password,
      });

      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);

      notifications.show({
        title: 'Account created!',
        message: 'Welcome to Task Manager',
        color: 'green',
      });

      navigate('/dashboard');
    } catch (error) {
      notifications.show({
        title: 'Registration failed',
        message: error.response?.data?.error || 'Something went wrong',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(form.values.password);

  return (
    <>
      <Title order={2} mb="md">
        Create account
      </Title>
      <Text c="dimmed" size="sm" mb="xl">
        Already have an account?{' '}
        <Anchor component={Link} to="/login" size="sm">
          Sign in
        </Anchor>
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Username"
            placeholder="johndoe"
            required
            {...form.getInputProps('username')}
          />

          <TextInput
            label="Full Name"
            placeholder="John Doe"
            required
            {...form.getInputProps('full_name')}
          />

          <TextInput
            label="Email"
            placeholder="your@email.com"
            required
            {...form.getInputProps('email')}
          />

          <div>
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              {...form.getInputProps('password')}
            />
            {form.values.password && (
              <Progress
                value={passwordStrength}
                color={
                  passwordStrength < 50
                    ? 'red'
                    : passwordStrength < 75
                    ? 'yellow'
                    : 'green'
                }
                size="sm"
                mt={5}
              />
            )}
          </div>

          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            required
            {...form.getInputProps('confirmPassword')}
          />

          <Button type="submit" fullWidth loading={loading}>
            Create account
          </Button>
        </Stack>
      </form>
    </>
  );
}

export default Register;
