# API Indoregion | [Live Production](https://indoregion.bakunya-dev.workers.dev/)

#### 1. Get All Provinces
Retrieves a list of all provinces. [Try](https://indoregion.bakunya-dev.workers.dev/provinces)
```bash 
GET /provinces
```

#### 2. Get All Regencies by Province ID
Retrieves a list of all regencies in a specified province. [Try](https://indoregion.bakunya-dev.workers.dev/regencies/18)
```bash 
GET /regencies/:idn_province_id
```

#### 3. Get All Districts by Regency ID
Retrieves a list of all districts in a specified regency. [Try](https://indoregion.bakunya-dev.workers.dev/districts/1806)
```bash 
GET /districts/:idn_regency_id
```

#### 4. Get All Villages by District ID
Retrieves a list of all villages in a specified district. [Try](https://indoregion.bakunya-dev.workers.dev/villages/180609)
```bash 
GET /villages/:idn_district_id
```
