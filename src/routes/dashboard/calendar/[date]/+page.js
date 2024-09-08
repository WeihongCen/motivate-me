export const load = ({ params }) => {
    const date = new Date(params.date);
    const timestamp = date.getTime();
    const localDate = new Date(params.date+"T00:00:00");
    const localTimestamp = localDate.getTime();
    const dateFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = localDate.toLocaleDateString('en-US', dateFormatOptions);

    return {
        date: params.date,
        timestamp,
        localTimestamp,
        formattedDate
    }
}