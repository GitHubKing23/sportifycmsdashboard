import { render, screen } from '@testing-library/react';
import BlogList from '../pages/BlogList';
import { BrowserRouter } from 'react-router-dom';

// Mock the fetchBlogs call
jest.mock('../services/api', () => ({
  fetchBlogs: jest.fn().mockResolvedValue([
    {
      _id: '1',
      title: 'Test Blog 1',
      category: 'NBA',
      featured: true,
      sections: [{ heading: 'Section 1', content: 'Test content 1' }],
      feature_image: '/uploads/test-image1.jpg',
    },
    {
      _id: '2',
      title: 'Test Blog 2',
      category: 'NFL',
      featured: false,
      sections: [{ heading: 'Section 2', content: 'Test content 2' }],
      feature_image: '/uploads/test-image2.jpg',
    },
  ]),
}));

describe('BlogList', () => {
  it('renders list of blogs', async () => {
    render(
      <BrowserRouter>
        <BlogList />
      </BrowserRouter>
    );

    expect(await screen.findByText('Test Blog 1')).toBeInTheDocument();
    expect(await screen.findByText('Test Blog 2')).toBeInTheDocument();
    expect(await screen.findByText('Section 1')).toBeInTheDocument();
  });
});
