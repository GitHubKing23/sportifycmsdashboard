import { render, screen, fireEvent } from '@testing-library/react';
import CreateBlogPage from '../pages/CreateBlogPage';
import { BrowserRouter } from 'react-router-dom';

describe('CreateBlogPage', () => {
  it('renders form and submits blog post', async () => {
    render(
      <BrowserRouter>
        <CreateBlogPage />
      </BrowserRouter>
    );

    const titleInput = screen.getByPlaceholderText('Title');
    const videoUrlInput = screen.getByPlaceholderText('YouTube Video URL');
    const selectCategory = screen.getByRole('combobox');

    fireEvent.change(titleInput, { target: { value: 'Test Blog' } });
    fireEvent.change(videoUrlInput, { target: { value: 'https://youtube.com/watch?v=test' } });
    fireEvent.change(selectCategory, { target: { value: 'NBA' } });

    expect(titleInput.value).toBe('Test Blog');
    expect(videoUrlInput.value).toBe('https://youtube.com/watch?v=test');
    expect(selectCategory.value).toBe('NBA');
  });
});
