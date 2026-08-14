import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { DarkUiToolbarShell } from './DarkUiToolbarShell';

test('keeps DarkUI navigation vertical and chat centered in the bottom dock', () =>
{
    render(
        <DarkUiToolbarShell
            isInRoom={ true }
            sideItems={ <button>Navigator</button> }
            identity={ <button>Me</button> }
            primaryItems={ <button>Inventory</button> }
            chatInput={ <input aria-label="Room chat" /> }
            socialItems={ <button>Friends</button> }
            friendBar={ <div>Friend bar</div> }
        />
    );

    expect(screen.getByRole('navigation', { name: 'DarkUI primary navigation' })).toHaveClass('darkui-side-toolbar');
    expect(screen.getByTestId('darkui-bottom-toolbar')).toHaveClass('darkui-bottom-toolbar');
    expect(screen.getByTestId('darkui-chat-slot')).toContainElement(screen.getByLabelText('Room chat'));
    expect(screen.getByText('Navigator')).not.toBe(screen.getByText('Inventory'));
});
