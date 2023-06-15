export function hasClass(el, className)
{
    if (el.classList)
        return el.classList.contains(className);
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

export function addClass(el, className)
{
    if (el.classList)
        el.classList.add(className)
    else if (!hasClass(el, className))
        el.className += " " + className;
}

export function removeClass(el, className)
{
    if (el.classList)
        el.classList.remove(className)
    else if (hasClass(el, className))
    {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        el.className = el.className.replace(reg, ' ');
    }
}

export function formatEventTime(eventDate) {
    let hours = formatWithLeadingZero(eventDate.getHours());
    let mins = formatWithLeadingZero(eventDate.getMinutes());
    return `${hours}:${mins}`;
}

export function formatWithLeadingZero(value) {
    return('0' + value).slice(-2);
}
