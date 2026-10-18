// Background color shown behind a profile photo whose background was removed
export const photoBackground = (info = {}, accentColor, fallback) => {
    if (!info.remove_bg) return undefined
    if (info.image_bg) return info.image_bg
    return fallback || accentColor + '70'
}
