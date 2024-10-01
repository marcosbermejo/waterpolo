import { parse, format } from 'date-fns';

export default function parseDate(date: string | null): { day: string, hour: string } {
    if (!date) return { day: '', hour: '' };

    const parsedDate = parse(`${date} Z`, 'yyyy-MM-dd HH:mm:ss X', new Date());
    if (!parsedDate) return { day: '', hour: '' };

    return {
        day: format(parsedDate, 'dd/MM'),
        hour: format(parsedDate, 'HH:mm'),
    }
};