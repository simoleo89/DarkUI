import { GetConfiguration } from '@nitrots/nitro-renderer';
import { CSSProperties, FC, useMemo } from 'react';
import { Base, Column } from '../../common';

interface LoadingViewProps {
    isError?: boolean;
    message?: string;
    homeUrl?: string;
    progress?: number;
    currentTask?: string;
}

const resolveConfigUrl = (key: string): string => {
    try {
        const raw = GetConfiguration().getValue<string>(key, '');
        return raw ? GetConfiguration().interpolate(raw) || raw : '';
    } catch {
        return '';
    }
};

const resolveConfigString = (key: string, fallback = ''): string => {
    try {
        return GetConfiguration().getValue<string>(key, '') || fallback;
    } catch {
        return fallback;
    }
};

export const LoadingView: FC<LoadingViewProps> = ({ isError = false, message = '', homeUrl = '', progress, currentTask = '' }) => {
    const customLogoUrl = useMemo(() => resolveConfigUrl('loading.logo.url'), []);
    const customBackground = useMemo(() => resolveConfigString('loading.background', ''), []);
    const progressBarColor = useMemo(() => resolveConfigString('loading.progress.color', 'linear-gradient(#bfd1d9 50%, #93acb7 50%)'), []);
    const storyImage = useMemo(() => Math.floor(Math.random() * 10) + 1, []);
    const clampedProgress = typeof progress === 'number' && Number.isFinite(progress) ? Math.max(0, Math.min(100, Math.round(progress))) : 0;
    const rootStyle: CSSProperties | undefined = customBackground ? { background: customBackground } : undefined;
    const storyStyle: CSSProperties | undefined = customLogoUrl
        ? { backgroundImage: `url("${customLogoUrl}")`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }
        : undefined;

    return (
        <Column fullHeight alignItems="center" justifyContent="center" className="nitro-loading darkui-loading" style={ rootStyle }>
            { isError ?
                <Column alignItems="center" className="darkui-loading-error text-center" gap={ 3 }>
                    <Base className="fs-4 text-shadow whitespace-pre-line">{ message }</Base>
                    { homeUrl && <a href={ homeUrl } className="btn btn-primary-ui-two text-white">Back to Hotel</a> }
                </Column>
                : <>
                    <div className="loading-stories" data-testid="darkui-loading-story">
                        <div className="loadingPhoto position-absolute" data-image={ storyImage } style={ storyStyle } />
                        <div className="imageOverlay position-absolute" />
                    </div>
                    <Column alignItems="center" className="darkui-loading-status text-center" gap={ 2 }>
                        { message && <Base className="fs-4 text-shadow">{ message }</Base> }
                        <div className="nitro-loading-bar">
                            <div className="nitro-loading-bar-inner" style={ { width: `${clampedProgress}%`, background: progressBarColor } } />
                        </div>
                        <div className="percent">{ clampedProgress }%</div>
                        { currentTask && <div className="darkui-loading-task">{ currentTask }</div> }
                    </Column>
                </> }
        </Column>
    );
};
