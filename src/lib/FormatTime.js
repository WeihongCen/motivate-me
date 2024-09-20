export function formatTimestampToAMPM(timestamp) {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
}

export function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    let result = '';
    if (hours > 0) {
        result += hours + 'h ';
    }
    if (minutes > 0) {
        result += minutes + 'm ';
    }
    if (seconds > 0 || result === '') {
        result += seconds + 's';
    }
    return result.trim();
}

export function formatTimer(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const formattedHours = hours > 0 ? String(hours).padStart(2, '0') + ':' : '';
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return formattedHours + formattedMinutes + ':' + formattedSeconds;
}

export function formatDateYYYYMMDD(year, month, day) {
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    return `${year}-${formattedMonth}-${formattedDay}`;
}

export function formatDateMonthYYYY(year, month) {
    const options = { month: 'short', year: 'numeric' };
    const today = new Date(year, month);
    const formattedDate = today.toLocaleDateString('en-US', options);
    return formattedDate;
}

export function isCurrentDate(dayTimestamp) {
    const now = new Date();
    const currentDateTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return dayTimestamp === currentDateTimestamp;
}