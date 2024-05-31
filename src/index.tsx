import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
	DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

function Seed() {
	return (
		<html>
			<body>
				<button id="seed">SEED</button>
				<script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js" />
				<script dangerouslySetInnerHTML={ {
					__html: `
					document.getElementById("seed").addEventListener("click", _ => {
						const data = [
							{
								url: "https://raw.githubusercontent.com/bakunya/bakunya.github.io/master/provinces.csv",
								name: "prov",
							},
							{
								url: "https://raw.githubusercontent.com/bakunya/bakunya.github.io/master/regencies.csv",
								name: "rege",
							},
							{
								url: "https://raw.githubusercontent.com/bakunya/bakunya.github.io/master/districts.csv",
								name: "dist",
							},
							{
								url: "https://raw.githubusercontent.com/bakunya/bakunya.github.io/master/villages.csv",
								name: "vill",
							},
						]

						data.forEach(el => {
							Papa.parse(el.url, {
								download: true,
								complete(data) {
									const header = data.data.shift()
									const mapping = data.data.map(v => {
										const obj = {}
										obj[header[0]] = v[0]
										obj[header[1]] = v[1]
										if(header[2]) {
											obj[header[2]] = v[2]
										}
										return obj
									})
									
									const toSave = {
										name: el.name,
										data: mapping
									}

									fetch("/seed", {
										method: "POST",
										body: JSON.stringify(toSave)
									}).catch(console.log)
								}
							})
						})

					})
				` } } />
			</body>
		</html>
	)
}

function Docs() {
	return (
		<html>
			<head>
				<title>Indoregion</title>
				<style dangerouslySetInnerHTML={{ __html: `
				
					* {
						font-family: sans-serif;
						margin: 0;
						padding: 0;
					}

					body {
						max-width: 800px;
						padding: 20px;
						margin: auto;
					}

					.main-title {
						margin-bottom: 50px;
					}
				
					.card {
						margin-top: 30px;
						border: 1px solid rgba(0,0,0,0.5);
						padding: 20px;
						border-radius: 20px;
					}

					.card p {
						margin-top: 10px;
					}

					.card .title {
						display: flex;
						justify-content: space-between;
						align-items: top;
						margin-bottom: 30px;
					}

					.card a {
						background: green;
						padding: 10px 30px;
						text-decoration: none;
						color: white;
						border-radius: 10px;
					}

				` }} />
			</head>
			<body>
				<div>
					<h1 class="main-title">API Documentation</h1>
					<section class="card">
						<div class="title">
							<h3>Get All Provinces</h3>
							<a target="_blank" href="/provinces">Try</a>
						</div>
						<p><strong>GET</strong> <code>/provinces</code></p>
						<p>Retrieves a list of all provinces.</p>
					</section>
					<section class="card">
						<div class="title">
							<h3>Get All Regencies by Province ID</h3>
							<a target="_blank" href="/regencies/18">Try</a>
						</div>
						<p><strong>GET</strong> <code>/regencies/:idn_province_id</code></p>
						<p>Retrieves a list of all regencies in a specified province.</p>
					</section>
					<section class="card">
						<div class="title">
							<h3>Get All Districts by Regency ID</h3>
							<a target="_blank" href="/districts/1806">Try</a>
						</div>
						<p><strong>GET</strong> <code>/districts/:idn_regency_id</code></p>
						<p>Retrieves a list of all districts in a specified regency.</p>
					</section>
					<section class="card">
						<div class="title">
							<h3>Get All Villages by District ID</h3>
							<a target="_blank" href="/villages/180609">Try</a>
						</div>
						<p><strong>GET</strong> <code>/villages/:idn_district_id</code></p>
						<p>Retrieves a list of all villages in a specified district.</p>
					</section>
				</div>
			</body>
		</html>
	)
}

app.use('*', cors())

app.get('/', (c) => {
	return c.html(<Docs />, 200)
})

app.get('/seed', async (c) => {
	return c.html(<Seed />)
})

app.post('/seed', async (c) => {
	async function insertProv(data: any) {
		const vals = data.filter((v: any) => v.id).map((v: any) => `("${v.id}", "${v.name}")`)
		await c.env.DB.prepare(`INSERT INTO provinces (id, name) VALUES ${vals.join(',')};`).run()
	}

	async function insertRege(data: any) {
		const vals = data.filter((v: any) => v.id).map((v: any) => `("${v.id}", "${v.idn_province_id}", "${v.name}")`)
		await c.env.DB.prepare(`INSERT INTO regencies (id, idn_province_id, name) VALUES ${vals.join(",")};`).run()
	}

	async function insertDist(data: any) {
		const filtered = data.filter((v: any) => v.id)
		while (filtered.length > 0) {
			const x = filtered.splice(0, 1000)
			const st = x.map((v: any) => `("${v.id}", "${v.idn_regency_id}", "${v.name}")`)
			await c.env.DB.prepare(`INSERT INTO districts (id, idn_regency_id, name) VALUES ${st.join(',')};`).run()
		}
	}

	async function insertVill(data: any) {
		const filtered = data.filter((v: any) => v.id)
		while (filtered.length > 0) {
			const x = filtered.splice(0, 1000)
			const st = x.map((v: any) => `("${v.id}", "${v.idn_district_id}", "${v.name}")`)
			await c.env.DB.prepare(`INSERT INTO villages (id, idn_district_id, name) VALUES ${st.join(',')};`).run()
		}
	}

	const data = await c.req.json()

	switch (data.name) {
		case "prov":
			await insertProv(data.data)
			break;
		case "rege":
			await insertRege(data.data)
			break;
		case "dist":
			await insertDist(data.data)
			break;
		case "vill":
			await insertVill(data.data)
			break;
		default:
			break;
	}

	return c.text("success", 200)
})

app.get('/provinces', async c => {
	const data = await c.env.DB.prepare(`SELECT * FROM provinces`).all()
	return c.json({ data: data.results })
})

app.get('/regencies/:idn_province_id', async c => {
	const data = await c.env.DB.prepare(`SELECT * FROM regencies WHERE idn_province_id = ?`).bind(c.req.param('idn_province_id')).all()
	return c.json({ data: data.results })
})

app.get('/districts/:idn_regency_id', async c => {
	const data = await c.env.DB.prepare(`SELECT * FROM districts WHERE idn_regency_id = ?`).bind(c.req.param('idn_regency_id')).all()
	return c.json({ data: data.results })
})

app.get('/villages/:idn_district_id', async c => {
	const data = await c.env.DB.prepare(`SELECT * FROM villages WHERE idn_district_id = ?`).bind(c.req.param("idn_district_id")).all()
	return c.json({ data: data.results })
})

export default app
