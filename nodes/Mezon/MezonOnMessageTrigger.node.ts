import { MezonClient } from 'mezon-sdk';
import { IDataObject, INodeType, INodeTypeDescription, ITriggerFunctions, ITriggerResponse, NodeConnectionType } from 'n8n-workflow';
import { MezonCredentials } from './types';

export class MezonOnMessageTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mezon On Message Trigger',
		name: 'mezonOnMessageTrigger',
		icon: 'file:mezon.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '',
		description: 'Interact with Mezon API',
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
				displayName: 'Mentioned User ID',
				name: 'mentionedUserId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Sender ID',
				name: 'senderId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Sender Name',
				name: 'senderName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Clan ID',
				name: 'clanId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Channel ID',
				name: 'channelId',
				type: 'string',
				default: '',
			},
		],
		inputs: [],
		outputs: [NodeConnectionType.Main]
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		let credential = await this.getCredentials<MezonCredentials>('mezonApi');
		var client = new MezonClient(
			credential.apiKey,
			credential.host,
			credential.port,
			true
		);
		await client.authenticate();
		var mentionedUserId = this.getNodeParameter('mentionedUserId') as string;
		var senderId = this.getNodeParameter('senderId') as string;
		var senderName = this.getNodeParameter('senderName') as string;
		var clanId = this.getNodeParameter('clanId') as string;
		var channelId = this.getNodeParameter('channelId') as string;
  	client.on("channel_message", (event: any) => {
			if (event.sender_id == credential.appId) {
				// Ignore my message
				return;
			}
			if (mentionedUserId != '' && !event.mentions.some((s: any) => s.user_id == mentionedUserId)) {
				return;
			}
			if (senderId != '' && event.sender_id != senderId) {
				return;
			}
			if (senderName != '' && event.username != senderName) {
				return;
			}
			if (clanId != '' && event.clan_id != clanId) {
				return;
			}
			if (channelId != '' && event.channel_id != channelId) {
				return;
			}
			this.emit([[{json: event as IDataObject}]]);
		});

		// The "closeFunction" function gets called by n8n whenever
		// the workflow gets deactivated and can so clean up.
		const closeFunction = async () => {
			client.closeSocket();
			client = new MezonClient();
		};

		return {
			closeFunction,
		};
	}
}
