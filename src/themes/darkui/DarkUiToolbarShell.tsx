import { ReactNode } from 'react';

type DarkUiToolbarShellProps = {
    isInRoom: boolean;
    sideItems: ReactNode;
    identity: ReactNode;
    primaryItems: ReactNode;
    chatInput?: ReactNode;
    socialItems: ReactNode;
    friendBar?: ReactNode;
};

export const DarkUiToolbarShell = ({
    isInRoom,
    sideItems,
    identity,
    primaryItems,
    chatInput,
    socialItems,
    friendBar
}: DarkUiToolbarShellProps) => (
    <div className="darkui-toolbar-shell" data-in-room={ isInRoom ? 'true' : 'false' }>
        <nav className="darkui-side-toolbar" aria-label="DarkUI primary navigation">
            { sideItems }
        </nav>
        <div className="darkui-bottom-toolbar" data-testid="darkui-bottom-toolbar">
            <div className="darkui-bottom-cluster darkui-bottom-cluster-primary">
                { identity }
                { primaryItems }
            </div>
            { isInRoom && chatInput &&
                <div className="darkui-chat-slot" data-testid="darkui-chat-slot">
                    { chatInput }
                </div> }
            <div className="darkui-bottom-cluster darkui-bottom-cluster-social">
                { socialItems }
                { friendBar }
            </div>
        </div>
    </div>
);
