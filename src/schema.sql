DROP TABLE IF EXISTS villages; CREATE TABLE villages (
	[id] INTEGER PRIMARY KEY, 
	[idn_district_id] TEXT NOT NULL,
	[name] TEXT NOT NULL
);

DROP TABLE IF EXISTS regencies; CREATE TABLE regencies (
	[id] INTEGER PRIMARY KEY, 
	[idn_province_id] TEXT NOT NULL,
	[name] TEXT NOT NULL
);

DROP TABLE IF EXISTS districts; CREATE TABLE districts (
	[id] INTEGER PRIMARY KEY, 
	[idn_regency_id] TEXT NOT NULL,
	[name] TEXT NOT NULL
);

DROP TABLE IF EXISTS provinces; CREATE TABLE provinces (
	[id] INTEGER PRIMARY KEY, 
	[name] TEXT NOT NULL
);