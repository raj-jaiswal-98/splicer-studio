import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import TemplateGallery from './TemplateGallery';
import { PosterProvider } from '../../context/PosterContext';

describe('TemplateGallery Component', () => {
  it('should render the gallery title', () => {
    render(
      <PosterProvider>
        <TemplateGallery />
      </PosterProvider>
    );
    expect(screen.getByText('Templates')).toBeDefined();
  });
});
