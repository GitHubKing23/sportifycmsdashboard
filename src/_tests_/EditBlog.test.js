import { render, screen } from '@testing-library/react';
import EditBlog from '../pages/EditBlog';
import { BrowserRouter } from 'react-router-dom';

describe('EditBlog', () => {
  it('renders edit blog page', () => {
    render(
      <BrowserRouter>
        <EditBlog />
      </BrowserRouter>
    );

    expect(screen.getByText(/Edit Blog/i)).toBeInTheDocument();
  });
});
