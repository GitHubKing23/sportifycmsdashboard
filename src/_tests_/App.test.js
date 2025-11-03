import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

describe('App Routing', () => {
    test('renders navbar links', () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );

        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/Create Blog/i)).toBeInTheDocument();
        expect(screen.getByText(/Manage Blogs/i)).toBeInTheDocument();
        expect(screen.getByText(/View Blogs/i)).toBeInTheDocument();
    });

    test('redirects unknown routes to dashboard', () => {
        render(
            <MemoryRouter initialEntries={['/non-existing-route']}>
                <App />
            </MemoryRouter>
        );

        // Checks for Dashboard heading since that’s your fallback page
        expect(screen.getByText(/Create Blog Post/i)).toBeInTheDocument();
    });
});
