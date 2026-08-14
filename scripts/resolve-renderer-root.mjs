export const resolveRendererRoot = ({ explicitRoot, candidates, exists }) =>
{
    if(explicitRoot && exists(explicitRoot)) return explicitRoot;

    return candidates.find(candidate => exists(candidate));
};
