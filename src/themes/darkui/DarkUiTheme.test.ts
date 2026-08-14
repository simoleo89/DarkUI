import { afterEach, describe, expect, it } from 'vitest';
import { activateDarkUiTheme, DARK_UI_THEME_CLASS } from './DarkUiTheme';

describe('activateDarkUiTheme', () => {
    afterEach(() => {
        document.documentElement.className = '';
    });

    it('activates the DarkUI theme without removing existing root classes', () => {
        document.documentElement.classList.add('existing-shell');

        const deactivate = activateDarkUiTheme(document.documentElement);

        expect(document.documentElement.classList.contains('existing-shell')).toBe(true);
        expect(document.documentElement.classList.contains(DARK_UI_THEME_CLASS)).toBe(true);

        deactivate();

        expect(document.documentElement.classList.contains('existing-shell')).toBe(true);
        expect(document.documentElement.classList.contains(DARK_UI_THEME_CLASS)).toBe(false);
    });
});
