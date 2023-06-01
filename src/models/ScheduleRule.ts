import { Table, Column, Default, Model, HasMany, BelongsTo, AllowNull, ForeignKey } from 'sequelize-typescript';

@Table({
	timestamps: false,
})
export class ScheduleRule {

	@AllowNull(false)
	@Column
	start_date: Date

	@Column
	initialized_through: Date

	@Column
	repeat_interval: number

	@Column
	repeat_year: number

	@Column
	repeat_month: number

	@Column
	repeat_day: number

	@Column
	repeat_week: number

	@Column
	repeat_weekday: number

}