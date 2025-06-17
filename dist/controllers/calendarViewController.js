"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventsForMonth = exports.getEventsForWeek = exports.getEventsForDay = void 0;
const prisma_1 = __importDefault(require("../prisma"));
// Helper de validation de date (YYYY-MM-DD)
function isValidDateString(date) {
    return !!date && /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
}
async function getEventsBetween(start, end) {
    const where = start === end
        ? { EVED_START: new Date(start) }
        : {
            EVED_START: {
                gte: new Date(start),
                lte: new Date(end),
            },
        };
    const prismaEvents = await prisma_1.default.event.findMany({
        where,
        orderBy: { EVED_START: 'asc' },
    });
    return sanitizeEvents(prismaEvents);
}
// Helpers pour transformer les résultats Prisma en Event stricts (tous les champs non-nuls)
function sanitizeEvent(prismaEvent) {
    return {
        EVEN_ID: prismaEvent.EVEN_ID,
        EVEC_LIB: prismaEvent.EVEC_LIB ?? '',
        EVED_START: prismaEvent.EVED_START ? new Date(prismaEvent.EVED_START).toISOString() : '',
        EVED_END: prismaEvent.EVED_END ? new Date(prismaEvent.EVED_END).toISOString() : '',
        USEN_ID: prismaEvent.USEN_ID ?? 0,
        ACCN_ID: prismaEvent.ACCN_ID ?? 0,
    };
}
function sanitizeEvents(events) {
    return events.map(sanitizeEvent);
}
const getEventsForDay = async (req, res) => {
    const date = typeof req.query.date === 'string' ? req.query.date : undefined;
    if (!isValidDateString(date)) {
        return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
    }
    try {
        const events = await getEventsBetween(date, date);
        // Ajouter des métadonnées pour faciliter l'implémentation front-end
        const result = {
            date: date,
            events: events,
        };
        return res.json(result);
    }
    catch (err) {
        return res.status(500).json({ error: 'Exception in getEventsBetween', detail: String(err) });
    }
};
exports.getEventsForDay = getEventsForDay;
const getEventsForWeek = async (req, res) => {
    // Accepter soit week/year, soit une date dans la semaine
    const date = typeof req.query.date === 'string' ? req.query.date : undefined;
    let week = typeof req.query.week === 'string' ? req.query.week : undefined;
    let year = typeof req.query.year === 'string' ? req.query.year : undefined;
    let firstDay;
    // Si date est fournie, calculer la semaine et l'année à partir de la date
    if (isValidDateString(date)) {
        const dateObj = new Date(date);
        const weekInfo = getISOWeekAndYear(dateObj);
        week = String(weekInfo.week);
        year = String(weekInfo.year);
        firstDay = getDateOfISOWeek(weekInfo.week, weekInfo.year);
    }
    else if (!week || !year || isNaN(Number(week)) || isNaN(Number(year))) {
        return res
            .status(400)
            .json({ error: 'Either date (YYYY-MM-DD) or week and year are required' });
    }
    else {
        firstDay = getDateOfISOWeek(Number(week), Number(year));
    }
    const start = firstDay.toISOString().slice(0, 10);
    const endDate = new Date(firstDay);
    endDate.setDate(endDate.getDate() + 6);
    const end = endDate.toISOString().slice(0, 10);
    try {
        const events = await getEventsBetween(start, end);
        // Générer un tableau des jours de la semaine pour faciliter l'affichage
        const days = [];
        const currentDate = new Date(firstDay);
        for (let i = 0; i < 7; i++) {
            days.push(currentDate.toISOString().slice(0, 10));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        // Ajouter des métadonnées pour faciliter l'implémentation front-end
        const result = {
            week: Number(week),
            year: Number(year),
            startDate: start,
            endDate: end,
            days: days,
            events: events,
        };
        return res.json(result);
    }
    catch (err) {
        return res.status(500).json({ error: 'Exception in getEventsBetween', detail: String(err) });
    }
};
exports.getEventsForWeek = getEventsForWeek;
const getEventsForMonth = async (req, res) => {
    // Accepter soit month/year, soit une date dans le mois
    const date = typeof req.query.date === 'string' ? req.query.date : undefined;
    let month = typeof req.query.month === 'string' ? req.query.month : undefined;
    let year = typeof req.query.year === 'string' ? req.query.year : undefined;
    let monthNum;
    let yearNum;
    // Si date est fournie, extraire le mois et l'année
    if (isValidDateString(date)) {
        const dateObj = new Date(date);
        monthNum = dateObj.getMonth() + 1; // getMonth() retourne 0-11
        yearNum = dateObj.getFullYear();
        month = String(monthNum);
        year = String(yearNum);
    }
    else if (!month || !year || isNaN(Number(month)) || isNaN(Number(year))) {
        return res
            .status(400)
            .json({ error: 'Either date (YYYY-MM-DD) or month and year are required' });
    }
    else {
        monthNum = Number(month);
        yearNum = Number(year);
    }
    try {
        const start = `${yearNum.toString().padStart(4, '0')}-${monthNum.toString().padStart(2, '0')}-01`;
        // Dernier jour du mois
        const endDate = new Date(yearNum, monthNum, 0);
        const end = endDate.toISOString().slice(0, 10);
        const events = await getEventsBetween(start, end);
        // Générer un tableau des jours du mois pour faciliter l'affichage
        const days = [];
        const daysInMonth = endDate.getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(`${yearNum.toString().padStart(4, '0')}-${monthNum.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`);
        }
        // Ajouter des métadonnées pour faciliter l'implémentation front-end
        const result = {
            month: monthNum,
            year: yearNum,
            startDate: start,
            endDate: end,
            daysInMonth: daysInMonth,
            days: days,
            events: events,
        };
        return res.json(result);
    }
    catch (err) {
        return res.status(500).json({ error: 'Exception in getEventsBetween', detail: String(err) });
    }
};
exports.getEventsForMonth = getEventsForMonth;
// Helper: get first day of ISO week
function getDateOfISOWeek(week, year) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}
function getISOWeekAndYear(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    // Get first day of year
    const yearStart = new Date(d.getFullYear(), 0, 1);
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    // Return array of year and week number
    return { week: weekNo, year: d.getFullYear() };
}
