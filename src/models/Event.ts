import { Table, Column, Default, Model, HasMany, BelongsTo, AllowNull, ForeignKey } from 'sequelize-typescript';

@Table({
	timestamps: false,
})
export class Event {
	@Column
	date_time: Date

	@Default(false)
	@Column
	modified: number
		
	@Default(false)
	@Column
	canceled: number
	
	@Column
	reason: string
}
