import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../app/login/page';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('LoginForm', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should display error message on login failure with incorrect credentials', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: false, message: 'Authentication failed' }),
      })
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByText(/sign in/i));

    const errorMessage = await screen.findByText(/authentication failed/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('should redirect to home page after successful login', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true }),
      })
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'correct@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'correctpassword' } });
    fireEvent.click(screen.getByText(/sign in/i));

    await screen.findByText(/signing in/i);
    expect(mockPush).toHaveBeenCalledWith('/home');
  });
});
