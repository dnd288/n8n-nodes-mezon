import { MezonClient } from 'mezon-sdk';
import { IDataObject, INodeType, INodeTypeDescription, ITriggerFunctions, ITriggerResponse } from 'n8n-workflow';
import { MezonCredentials } from './types';

export class MezonTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mezon Trigger',
		name: 'mezonTrigger',
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
				displayName: 'Event',
				name: 'event',
				type: 'string',
				default: 'channel_message',
			},
		],
		inputs: [],
		outputs: []
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		let credential = await this.getCredentials<MezonCredentials>('mezonApi');
		const client = new MezonClient(
			credential.apiKey,
			credential.host,
			credential.port,
			true
		);
		await client.authenticate();
  	client.on("channel_message", (event: any) => {
			this.emit([[{json: event as IDataObject}]]);
		});

		// The "closeFunction" function gets called by n8n whenever
		// the workflow gets deactivated and can so clean up.
		const closeFunction = async () => {

		};

		return {
			closeFunction,
		};
	}
}
