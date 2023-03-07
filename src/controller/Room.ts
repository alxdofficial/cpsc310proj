
export default class Room {
	public readonly fullname: string;
	public readonly shortname: string;
	public readonly number: string;
	public readonly name: string;
	public readonly address: string;
	public readonly lat: number;
	public readonly lon: number;
	public readonly seats: number;
	public readonly type: number;
	public readonly furniture: number;
	public readonly href: number;

	constructor(fullname: string, shortname: string, number: string, name: string,
		address: string, lat: number, lon: number, seats: number, type: number, furniture: number, href: number) {
		this.fullname = fullname;
		this.shortname = shortname;
		this.number = number;
		this.name = name;
		this.address = address;
		this.lat = lat;
		this.lon = lon;
		this.seats = seats;
		this.type = type;
		this.furniture = furniture;
		this.href = href;

	}

}
