import { Container, Paper, Title, Text, Box } from '@mantine/core';

function AuthLayout({ children }) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container size={420} my={40}>
        <Box mb={30} style={{ textAlign: 'center' }}>
          <Title
            order={1}
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: 'white',
              marginBottom: 10,
            }}
          >
            Task Manager
          </Title>
          <Text c="white" size="lg" fw={500}>
            Organize your work and life
          </Text>
        </Box>

        <Paper withBorder shadow="xl" p={30} radius="md">
          {children}
        </Paper>
      </Container>
    </Box>
  );
}

export default AuthLayout;
