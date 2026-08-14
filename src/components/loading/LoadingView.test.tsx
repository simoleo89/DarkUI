import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { LoadingView } from './LoadingView';

test('uses the DarkUI story frame instead of Nitro V3 branding', () =>
{
    render(<LoadingView message="Getting ready" progress={ 42 } currentTask="Loading assets" />);

    expect(screen.getByTestId('darkui-loading-story')).toBeInTheDocument();
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByText('Loading assets')).toBeInTheDocument();
    expect(screen.queryByAltText('Nitro V3')).not.toBeInTheDocument();
});
