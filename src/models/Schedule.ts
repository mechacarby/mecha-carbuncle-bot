import { Table, Column, Default, Model, HasMany, BelongsTo, AllowNull, ForeignKey } from 'sequelize-typescript';

@Table({
	timestamps: false,
})
export class Schedule {

	@AllowNull(false)
	@Column
	guild_id: string
	
	@AllowNull(false)
	@Default('Raid')
	@Column
	name: string

	@Column
	role: string

	@Column
	reminder_channel: string

	@Column
	timezone: string

	@Default(false)
	@Column
	reminder_24h: boolean

	@Default(false)
	@Column
	reminder_12h: boolean

	@Default(false)
	@Column
	reminder_1h: boolean

	@Default(true)
	@Column
	reminder_0h: boolean

	@Default(false)
	@Column
	repeats: boolean
}
