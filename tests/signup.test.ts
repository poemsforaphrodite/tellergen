import { render, screen, fireEvent } from '@testing-library/react';
import SignupForm from '../app/signup/page';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('SignupForm', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should display error message on signup failure with existing email', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: false, message: 'Email already exists' }),
      })
    );

    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText(/sign up/i));

    const errorMessage = await screen.findByText(/email already exists/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('should redirect to login page after successful signup', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true }),
      })
    );

    render(<SignupForm />);

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText(/sign up/i));

    await screen.findByText(/signing up/i);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
