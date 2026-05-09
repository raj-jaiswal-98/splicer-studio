import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CanvasEditor from './CanvasEditor';
import { PosterProvider } from '../../context/PosterContext';

describe('CanvasEditor Component', () => {
  it('should render the canvas editor title', () => {
    render(
      <PosterProvider>
        <CanvasEditor />
      </PosterProvider>
    );
    expect(screen.getByText('Canvas Editor')).toBeDefined();
  });
});
