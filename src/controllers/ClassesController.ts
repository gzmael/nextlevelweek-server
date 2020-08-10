/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
import { Request, Response } from 'express';
import db from '../database/connection';
import converHourToMinute from '../utils/convertHourToMinutes';

interface ScheduleDTO {
  // eslint-disable-next-line camelcase
  week_day: number;
  from: string;
  to: string;
}

export default class ClassesController {
  async index(request: Request, response: Response): Promise<any> {
    const filters = request.query;

    const subject = filters.subject as string;
    const week_day = filters.week_day as string;
    const time = filters.time as string;

    if (!filters.week_day || !filters.subject || !filters.time) {
      return response.status(400).json({
        error: 'Missing filters to search classes',
      });
    }

    const timeInMinutes = converHourToMinute(time);

    const classes = await db('classes')
      // eslint-disable-next-line func-names
      .whereExists(function () {
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
          .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
          .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
          .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes]);
      })
      .where('classes.subject', '=', subject as string)
      .join('users', 'classes.user_id', '=', 'users.id')
      .select(['classes.*', 'users.*']);

    return response.json(classes);
  }

  async create(request: Request, response: Response): Promise<any> {
    const {
      name,
      avatar,
      bio,
      whatsapp,
      cost,
      subject,
      schedules,
    } = request.body;

    const trx = await db.transaction();
    try {
      const insertedUserIds = await trx('users').insert({
        name,
        avatar,
        whatsapp,
        bio,
      });

      const insertedClassIds = await trx('classes').insert({
        subject,
        cost,
        user_id: insertedUserIds[0],
      });

      const allSchedules = schedules.map((schedule: ScheduleDTO) => {
        return {
          week_day: schedule.week_day,
          from: converHourToMinute(schedule.from),
          to: converHourToMinute(schedule.to),
          class_id: insertedClassIds[0],
        };
      });

      const SchedulesIDs = await trx('class_schedule').insert(allSchedules);

      await trx.commit();
      return response.json(SchedulesIDs);
    } catch (err) {
      await trx.rollback();
      console.log(err);
      return response.status(400).json({
        error: 'Unexpected error while creating a new class',
      });
    }
  }
}
