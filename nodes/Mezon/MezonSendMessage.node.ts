import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import { MezonCredentials } from './types';
import { MezonClient } from 'mezon-sdk';

export class MezonSendMessage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mezon Send Message',
		name: 'mezonSendMessage',
		icon: 'file:mezon.svg',
		group: ['action'],
		version: 1,
		subtitle: '',
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
				displayName: 'Channel ID',
				name: 'channelId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				default: '',
			},
		],
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		let credential = await this.getCredentials<MezonCredentials>('mezonApi');
		var client = new MezonClient(credential.apiKey);
		await client.login();
		console.log(`n8n-nodes-mezon: Send Message trigger: Bot ${credential.appId} started`);
		try {
			for (let i = 0; i < this.getInputData().length; i++) {
				const channelId = this.getNodeParameter('channelId', i) as string;
				const content = this.getNodeParameter('content', i) as string;

				const channel = await client.channels.fetch(channelId);
				if (!channel) {
					console.log(`Channel with ID ${channelId} not found.`);
				}
				await channel.send({ t: content});
				console.log(`Send message to channel ${channelId}`);
			}
		} catch (error) {
			console.log('Error sending message:', error);
		} finally {
			console.log('MezonSendMessage: closing client socket');
			client.closeSocket();
		}

		return this.prepareOutputData([]);
	}
}
