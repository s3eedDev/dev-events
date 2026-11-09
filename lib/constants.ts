export type EvenetItem = {
	image: string;
	title: string;
	slug: string;
	location: string;
	date: string;
	time: string;
}


export const events: EvenetItem[] = [
	{
		image: '/images/event1.png',
		title: 'Google I/O 2027',
		slug: 'google-io-2027',
		location: 'Mountain View, CA',
		date: 'May 12, 2027',
		time: '9:00 AM PST'
	},
	{
		image: '/images/event2.png',
		title: 'React Conf 2027',
		slug: 'react-conf-2027',
		location: 'San Francisco, CA',
		date: 'March 15, 2027',
		time: '10:00 AM PST'
	},
	{
		image: '/images/event3.png',
		title: 'AWS re:Invent 2027',
		slug: 'aws-reinvent-2027',
		location: 'Las Vegas, NV',
		date: 'November 30, 2027',
		time: '8:00 AM PST'
	},
	{
		image: '/images/event4.png',
		title: 'PyCon US 2027',
		slug: 'pycon-us-2027',
		location: 'Salt Lake City, UT',
		date: 'April 23, 2027',
		time: '9:00 AM MDT'
	},
	{
		image: '/images/event5.png',
		title: 'DotNet Conf 2027',
		slug: 'dotnet-conf-2027',
		location: 'Chicago, IL',
		date: 'November 16, 2027',
		time: '11:00 AM CST'
	},
	{
		image: '/images/event6.png',
		title: 'GitHub Universe 2027',
		slug: 'github-universe-2027',
		location: 'San Francisco, CA',
		date: 'October 18, 2027',
		time: '9:00 AM PST'
	}
];
