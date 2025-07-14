import { MezonClient } from 'mezon-sdk';
import { INodeType, INodeTypeDescription, ITriggerFunctions, ITriggerResponse, NodeConnectionType } from 'n8n-workflow';
import { MezonCredentials } from './types';

export class MezonBotReplyTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mezon Bot Reply Trigger',
		name: 'mezonBotReplyTrigger',
		icon: 'file:mezon.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '',
		description: 'Interact with Mezon Bot',
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
				displayName: 'Bot Logic URL',
				name: 'botLogicUrl',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'On Mentioned Only',
				name: 'onMentionedOnly',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'From Sender ID',
				name: 'senderId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'In Clan ID',
				name: 'clanId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'In Channel ID',
				name: 'channelId',
				type: 'string',
				default: '',
			}
		],
		inputs: [],
		outputs: [NodeConnectionType.Main]
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		let credential = await this.getCredentials<MezonCredentials>('mezonApi');
		var client = new MezonClient(credential.apiKey);
		await client.login();
		console.log(`n8n-nodes-mezon: Bot ${credential.appId} started`);
		var onMentionedOnly = this.getNodeParameter('onMentionedOnly') as boolean;
		var senderId = this.getNodeParameter('senderId') as string;
		var clanId = this.getNodeParameter('clanId') as string;
		var channelId = this.getNodeParameter('channelId') as string;
		var botLogicUrl = this.getNodeParameter('botLogicUrl') as string;

		client.onChannelMessage(async (event) => {
			if (event.sender_id == credential.appId) {
				// Ignore my message
				return;
			}
			if (onMentionedOnly && !event?.mentions?.find((mention) => mention.user_id === credential.appId)) {
				return;
			}
			if (clanId != '' && event.clan_id != clanId) {
				return;
			}
			const channelFetch = await client.channels.fetch(event.channel_id);
			if (!event.message_id) {
				console.warn("event.message_id is undefined, skipping message fetch.");
				return;
			}
			const messageFetch = await channelFetch.messages.fetch(event.message_id);
			if (senderId != '') {
				if (senderId.indexOf(',') >= 0) {
					const senderIds = senderId.split(',');
					if (!senderIds.includes(event.sender_id)) {
						messageFetch.reply({ t: "You are not allowed to trigger this bot." });
						return;
					}
				} else if (event.sender_id != senderId) {
					messageFetch.reply({ t: "You are not allowed to trigger this bot." });
					return;
				}
			}
			if (channelId != '') {
				if (channelId.indexOf(',') >= 0) {
					const channelIds = channelId.split(',');
					if (!channelIds.includes(event.channel_id)) {
						messageFetch.reply({ t: "You are not allowed to trigger this bot in this channel." });
						return;
					}
				} else if (event.channel_id != channelId) {
					messageFetch.reply({ t: "You are not allowed to trigger this bot in this channel." });
					return;
				}
			}

			// call to URL and get response
			const response = await fetch(botLogicUrl, {
				method: "POST",
				headers: {
					"n8n-auth": credential.apiKey ?? "",
				},
				body: JSON.stringify(event),
			});
			const content = await response.json() as any;
			messageFetch.reply(content);
  	})

		// The "closeFunction" function gets called by n8n whenever
		// the workflow gets deactivated and can so clean up.
		const closeFunction = async () => {
			console.log(`n8n-nodes-mezon: ${credential.appId} stopped`);
			client.closeSocket();
		};

		return {
			closeFunction,
		};
	}
}
