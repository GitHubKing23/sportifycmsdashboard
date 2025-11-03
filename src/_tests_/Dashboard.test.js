import { render, screen } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import { BrowserRouter } from 'react-router-dom';

describe('Dashboard', () => {
  it('renders dashboard title', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/Create Blog Post/i)).toBeInTheDocument();
  });
});
