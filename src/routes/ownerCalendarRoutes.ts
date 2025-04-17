import { Router } from 'express';
import {
  getOwnerCalendars,
  getOwnerCalendarById,
  createOwnerCalendar,
  updateOwnerCalendar,
  deleteOwnerCalendar,
} from '../controllers/ownerCalendarController';

const router = Router();

router.get('/owner-calendars', getOwnerCalendars);
router.get('/owner-calendars/:id', getOwnerCalendarById);
router.post('/owner-calendars', createOwnerCalendar);
router.put('/owner-calendars/:id', updateOwnerCalendar);
router.delete('/owner-calendars/:id', deleteOwnerCalendar);

export default router;
