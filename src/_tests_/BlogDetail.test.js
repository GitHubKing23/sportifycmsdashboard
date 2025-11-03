import { render, screen } from '@testing-library/react';
import BlogDetail from '../pages/BlogDetail';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock the fetchBlogById call
jest.mock('../services/api', () => ({
  fetchBlogById: jest.fn().mockResolvedValue({
    title: 'Test Blog',
    category: 'NBA',
    author: 'Test Author',
    feature_image: '/uploads/test-image.jpg',
    video_url: 'https://youtube.com/watch?v=test',
    sections: [
      { heading: 'Intro', content: 'Test section content' }
    ],
    featured: true
  }),
}));

describe('BlogDetail', () => {
  it('renders blog details', async () => {
    render(
      <MemoryRouter initialEntries={['/blog/123']}>
        <Routes>
          <Route path="/blog/:id" element={<BlogDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Test Blog')).toBeInTheDocument();
    expect(await screen.findByText(/Test Author/i)).toBeInTheDocument();
    expect(await screen.findByText(/Test section content/i)).toBeInTheDocument();
  });
});
