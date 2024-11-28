import { MezonClient } from 'mezon-sdk';
import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, isObjectEmpty, NodeConnectionType } from 'n8n-workflow';
import { MezonCredentials } from './types';

export class MezonSendMessage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mezon Send Message',
		name: 'mezonSendMessage',
		icon: 'file:mezon.svg',
		group: ['action'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send message to Mezon',
		defaults: {
			name: 'Mezon',
		},
		credentials: [
			{
				name: 'mezonApi',
				required: true,
			},
		],
		/**
		 * In the properties array we have two mandatory options objects required
		 *
		 * [Resource & Operation]
		 *
		 * https://docs.n8n.io/integrations/creating-nodes/code/create-first-node/#resources-and-operations
		 *
		 * In our example, the operations are separated into their own file (HTTPVerbDescription.ts)
		 * to keep this class easy to read.
		 *
		 */
		properties: [
			{
				displayName: 'ClanId',
				name: 'clanId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'ChannelId',
				name: 'channelId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'number',
				default: 2,
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Reference',
				name: 'ref',
				type: 'json',
				default: '',
			},
		],
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		let credential = await this.getCredentials<MezonCredentials>('mezonApi');
		const client = new MezonClient(
			credential.apiKey,
			credential.host,
			credential.port,
			true
		);
		await client.authenticate();
		var input = this.getInputData();
		const length = input.length;
		var returnItem: INodeExecutionData[] = [];
		for (var i = 0; i < length; i++) {
			const refObj = this.getNodeParameter('ref', i, {}) as any;
			var ref = {};
			if (!isObjectEmpty(refObj)) {
				ref = {
					message_id: '',
					message_ref_id: refObj.message_id as string,
					ref_type: 0,
					message_sender_id: refObj.sender_id as string,
					message_sender_username: refObj.username as string,
					mesages_sender_avatar: refObj.avatar as string,
					message_sender_clan_nick: refObj.clan_nick as string,
					message_sender_display_name: refObj.display_name as string,
					content: JSON.stringify(refObj.content),
					has_attachment: false,
				}
			}
			await client.sendMessage(
				this.getNodeParameter('clanId', i, '') as string,
				this.getNodeParameter('channelId', i, '') as string,
				this.getNodeParameter('mode', i, 2) as number,
				true,
				{ t: this.getNodeParameter('content', i, '') as string, },
				[],
				[],
				[
					ref,
				]
			);
			returnItem.push({
				json: {}
			});
		}

		const returnData: INodeExecutionData[][] = [];

		returnData.push(returnItem);
		client.closeSocket();
		return returnData;
	}
}
