import { Table, Column, Model, HasMany, BelongsTo, AllowNull, ForeignKey } from 'sequelize-typescript';
import { Schedule } from './Schedule';
import { Event } from './Event';

@Table({ timestamps: false })
export class ScheduleRule extends Model {

	@AllowNull(false)
	@Column
	start_date: Date;

	@Column
	initialized_through: Date;

	@Column
	repeat_interval: number;

	@Column
	repeat_year: number;

	@Column
	repeat_month: number;

	@Column
	repeat_day: number;

	@Column
	repeat_week: number;

	@Column
	repeat_weekday: number;

	@AllowNull(false)
	@ForeignKey(() => Schedule)
	@Column
	scheduleId: number;

	@BelongsTo(() => Schedule)
	schedule: Schedule;

	@HasMany(() => Event)
	events: Event[];

}