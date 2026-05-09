import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ControlPanel from './ControlPanel';
import { PosterProvider } from '../../context/PosterContext';

describe('ControlPanel Component', () => {
  it('should render the control panel title', () => {
    render(
      <PosterProvider>
        <ControlPanel />
      </PosterProvider>
    );
    expect(screen.getByText('Controls')).toBeDefined();
  });
});
