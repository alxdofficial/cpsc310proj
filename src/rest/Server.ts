import express, {Application, Request, Response} from "express";
import * as http from "http";
import cors from "cors";
import InsightFacade from "../controller/InsightFacade";
import {InsightDatasetKind} from "../controller/IInsightFacade";

export default class Server {
	private readonly port: number;
	private express: Application;
	private server: http.Server | undefined;

	private static facade: InsightFacade;

	constructor(port: number) {
		console.info(`Server::<init>( ${port} )`);
		this.port = port;
		this.express = express();

		this.registerMiddleware();
		this.registerRoutes();
		Server.facade = new InsightFacade();

		/** NOTE: you can serve static frontend files in from your express server
		 * by uncommenting the line below. This makes files in ./frontend/public
		 * accessible at http://localhost:<port>/
		 */
		// this.express.use(express.static("./frontend/public"))
	}

	/**
	 * Starts the server. Returns a promise that resolves if success. Promises are used
	 * here because starting the server takes some time and we want to know when it
	 * is done (and if it worked).
	 *
	 * @returns {Promise<void>}
	 */
	public start(): Promise<void> {
		return new Promise((resolve, reject) => {
			console.info("Server::start() - start");
			if (this.server !== undefined) {
				console.error("Server::start() - server already listening");
				reject();
			} else {
				this.server = this.express.listen(this.port, () => {
					console.info(`Server::start() - server listening on port: ${this.port}`);
					resolve();
				}).on("error", (err: Error) => {
					// catches errors in server start
					console.error(`Server::start() - server ERROR: ${err.message}`);
					reject(err);
				});
			}
		});
	}

	/**
	 * Stops the server. Again returns a promise so we know when the connections have
	 * actually been fully closed and the port has been released.
	 *
	 * @returns {Promise<void>}
	 */
	public stop(): Promise<void> {
		console.info("Server::stop()");
		return new Promise((resolve, reject) => {
			if (this.server === undefined) {
				console.error("Server::stop() - ERROR: server not started");
				reject();
			} else {
				this.server.close(() => {
					console.info("Server::stop() - server closed");
					resolve();
				});
			}
		});
	}

	// Registers middleware to parse request before passing them to request handlers
	private registerMiddleware() {
		// JSON parser must be place before raw parser because of wildcard matching done by raw parser below
		this.express.use(express.json());
		this.express.use(express.raw({type: "application/*", limit: "10mb"}));

		// enable cors in request headers to allow cross-origin HTTP requests
		this.express.use(cors());
	}

	// Registers all request handlers to routes
	private registerRoutes() {
		// This is an example endpoint this you can invoke by accessing this URL in your browser:
		// http://localhost:4321/dataset/hello
		 this.express.put("/dataset/:id/:kind", Server.putDataset);
		this.express.delete("/dataset/:id", Server.deleteDataset);
		this.express.get("/datasets", Server.showDatasets);
		// this.express.post("/query", Server.query);

	}

	private static putDataset(req: Request, res: Response) {
		try {
			console.log(req.params.id);
			console.log(req.params.kind);
			const dataKind: InsightDatasetKind = Server.getKind(req.params.kind);
			const buffer = req.body as Buffer;
			const content = buffer.toString("base64");
			Server.facade.addDataset(req.params.id, content, dataKind)
				.then((arr) => {
					const jsonObj = JSON.stringify(arr);
					res.status(200).json({result: JSON.parse(jsonObj)});
				})
				.catch((err) => {
					res.status(400).json({error: err.toString()});
				});
		} catch (err) {
			console.log(err);
			res.status(400).json({error: err});
		}
	}

	private static getKind(requestKind: string): InsightDatasetKind {
		if (requestKind.toLowerCase().includes("rooms")) {
			return InsightDatasetKind.Rooms;
		} else {
			return InsightDatasetKind.Sections;
		}
	}

	private static deleteDataset(req: Request, res: Response) {
		try {
			Server.facade.removeDataset(req.params.id)
				.then((id: string) => {
					res.status(200).json({result: JSON.parse(id)});
				})
				.catch((err) => {
					if (err.toString() === "Error: ID Doesn't exist"){
						res.status(404).json({error: err.toString()});
					} else {
						res.status(400).json({error: err.toString()});
					}
				});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	private static query(req: Request, res: Response) {
		try {
			Server.facade.crashRecovery(); // check for persistant data structure on disk
			Server.facade.performQuery(req.body)
				.then((arr) => {
					const jsonObj = JSON.stringify(arr);
					res.status(200).json({result: JSON.parse(jsonObj)});
				})
				.catch((err) => {
					res.status(400).json({error: err.toString()});
				});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	private static showDatasets(req: Request, res: Response) {
		try {
			Server.facade.listDatasets()
				.then((arr) => {
					const jsonObj = JSON.stringify(arr);
					res.status(200).json({result: JSON.parse(jsonObj)});
				});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}


	/**
	 * The next two methods handle the echo service.
	 * These are almost certainly not the best place to put these, but are here for your reference.
	 * By updating the Server.echo function pointer above, these methods can be easily moved.
	 */
	// private static echo(req: Request, res: Response) {
	// 	try {
	// 		console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
	// 		console.log(req.params);
	// 		const response = Server.performEcho(req.params.msg);
	// 		res.status(200).json({result: response});
	// 	} catch (err) {
	// 		res.status(400).json({error: err});
	// 	}
	// }
	//
	// private static performEcho(msg: string): string {
	// 	if (typeof msg !== "undefined" && msg !== null) {
	// 		return `${msg}...${msg}`;
	// 	} else {
	// 		return "Message not provided";
	// 	}
	// }
}
