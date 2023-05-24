import { Snowflake } from 'discord.js';
import { Question } from './Question'
import { Table, Column, Model, BelongsTo, AllowNull, ForeignKey } from 'sequelize-typescript';


export class Response extends Model {
	
	@AllowNull(false)
	@Column
	user_id: Snowflake;

	@AllowNull(false)
	@ForeignKey(() => Question)
	@Column
	questionId: number;

	@AllowNull(false)
	@BelongsTo(() => Question)
	question: Question

}