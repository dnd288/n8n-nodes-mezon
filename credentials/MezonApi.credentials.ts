import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MezonApi implements ICredentialType {
	name = 'mezonApi';
	displayName = 'Mezon API';
	documentationUrl = 'https://developers.mezon.ai';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			}
		},
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: 'api.mezon.vn',
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number',
			default: '443',
		},
	];
}
