import { property } from '../../helpers/property';
import { findChannelByIdAndUser } from '../../helpers/findChannelByIdAndUser';

export const schema = `
	type Channel {
 		id: String!
		name: String
		description: String
		announcement: String
		topic: String
		members: [User]
		owners: [User]
		numberOfMembers: Int
		numberOfMessages: Int
		readOnly: Boolean
		direct: Boolean
		privateChannel: Boolean
		favourite: Boolean
		unseenMessages: Int
	}
`;

export const resolver = {
	Channel: {
		id: property('_id'),
		name: (root, args, { user }) => {
			if (root.t === 'd') {
				return root.usernames.find(u => u !== user.username);
			}

			return root.name;
		},
		members: (root) => {
			return root.usernames.map(
				username => RocketChat.models.Users.findOneByUsername(username)
			);
		},
		owners: (root) => {
			// there might be no owner
			if (!root.u) {
				return;
			}

			return [RocketChat.models.Users.findOneByUsername(root.u.username)];
		},
		numberOfMembers: (root) => (root.usernames || []).length,
		numberOfMessages: property('msgs'),
		readOnly: (root) => root.ro === true,
		direct: (root) => root.t === 'd',
		privateChannel: (root) => root.t === 'p',
		favourite: (root, args, { user }) => {
			const room = findChannelByIdAndUser({
				params: {
					roomId: root._id,
					userId: user._id
				},
				options: { fields: { f: 1 }}
			});

			return room && room.f === true;
		},
		unseenMessages: (root, args, { user }) => {
			const room = findChannelByIdAndUser({
				params: {
					roomId: root._id,
					userId: user._id
				},
				options: { fields: { unread: 1 }}
			});

			return (room || {}).unread;
		}
	}
};