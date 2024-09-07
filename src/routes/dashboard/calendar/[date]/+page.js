export const load = ({ params }) => {
    function dateToTimestamp() {
        const date = new Date(params.date);
        return date.getTime();
    }

    return {
        date: params.date,
        timestamp: dateToTimestamp()
    }
}