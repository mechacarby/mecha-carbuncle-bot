import { Table, Column, Default, Model, BelongsTo, AllowNull, ForeignKey } from 'sequelize-typescript';
import { ScheduleRule } from './ScheduleRule';


@Table({
	timestamps: false,
})
export class Event extends Model {
	@Column
	date_time: Date;

	@Default(false)
	@Column
	modified: boolean;

	@Default(false)
	@Column
	canceled: boolean;

	@Column
	reason: string;

	@AllowNull(false)
	@ForeignKey(() => ScheduleRule)
	@Column
	scheduleRuleId: number;

	@BelongsTo(() => ScheduleRule)
	scheduleRule: ScheduleRule;
}
