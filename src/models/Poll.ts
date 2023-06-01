import { Snowflake } from 'discord.js';
import { Question } from './Question';
import { Table, Column, Model, HasMany, AllowNull, DataType } from 'sequelize-typescript';

@Table({timestamps: false})
export class Poll extends Model {
	@AllowNull(false)
	@Column
	guild_id: Snowflake;

	@AllowNull(false)
	@Column
	channel_id: Snowflake;

	@Column
	message_id: Snowflake;

	@Column
	title: string;

	@Column
	ends_at: Date;

	@Column
	show_users: boolean;

	@Column
	multiselect: boolean;

	@Column
	max_votes: number;

	@Column
	role: Snowflake;

	@Column({ type: DataType.STRING })
	hide_results: string | null;

	@HasMany(() => Question)
	questions: Question[];
}
