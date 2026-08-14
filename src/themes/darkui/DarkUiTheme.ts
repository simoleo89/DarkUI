export const DARK_UI_THEME_CLASS = 'darkui-theme';

export const activateDarkUiTheme = (root: HTMLElement) => {
    root.classList.add(DARK_UI_THEME_CLASS);

    return () => root.classList.remove(DARK_UI_THEME_CLASS);
};
