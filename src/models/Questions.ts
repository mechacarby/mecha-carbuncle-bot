import { Poll } from './Polls'
import { Response } from './Responses'
import { Table, Column, Model, HasMany, BelongsTo, AllowNull, ForeignKey } from 'sequelize-typescript';

@Table
export class Question extends Model {
	
	@AllowNull(false)
	@Column
	value: string;

	@AllowNull(false)
	@Column
	custom_id : string

	@AllowNull(false)
	@ForeignKey(() => Poll)
	@Column
	pollId: number;

	@AllowNull(false)
	@BelongsTo(() => Poll)
	poll: Poll;

	@HasMany(() => Response)
	responses: Response[];
}