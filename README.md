# E-commerce - Dyqan Online në Shqip

Një aplikacion e-commerce modern dhe i plotë me interface në gjuhën shqipe, i ndërtuar me Node.js, Express, MySQL, EJS, dhe React për panelin administrativ.

## 🚀 Karakteristikat

### Dyqani Online (Interface në Shqip)
- **Faqja Kryesore** - Shfaq të gjitha produktet me dizajn modern
- **Kërkimi i Produkteve** - Kërkim në kohë reale (live search) për desktop dhe mobile
- **Faqja e Produktit** - Detaje të plota të produktit me mundësi blerje
- **Sistemi i Përdoruesve** - Regjistrim, kyçje, dhe menaxhim i profilit
- **Porositë e Mia** - Përdoruesit mund të shohin historikun e porosive të tyre
- **Faturat** - Gjenerimi automatik i faturave për çdo blerje
- **Responsive Design** - Dizajn i plotë responsive për mobile, tablet, dhe desktop
- **Mobile Drawer Navigation** - Navigim modern me drawer për pajisje mobile
- **Të Gjitha Tekstet në Shqip** - Interface 100% në gjuhën shqipe

### Paneli Administrativ (React + TypeScript)
- **Dashboard** - Statistika, grafikë shitjesh, dhe metrika kryesore
- **Menaxhimi i Produkteve** - CRUD i plotë për produkte
- **Menaxhimi i Porosive** - Shiko dhe menaxho porositë e klientëve
- **Menaxhimi i Përdoruesve** - Menaxho përdoruesit dhe rolet
- **Autentifikim i Sigurt** - JWT authentication për admin
- **Interface në Shqip** - Paneli administrativ gjithashtu në shqip

## 🛠️ Teknologjitë e Përdorura

### Frontend - Dyqani Online
- **EJS** - Template engine për faqet HTML
- **CSS3** - Dizajn modern me gradient dhe animacione
- **JavaScript (Vanilla)** - Interaktivitet dhe live search
- **Responsive Design** - Mobile-first approach

### Frontend - Paneli Administrativ
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool i shpejtë
- **Material UI (MUI)** - Component library
- **React Router** - Navigimi
- **Recharts** - Vizualizimi i të dhënave
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Databaza relationale (shop_163)
- **MySQL2** - MySQL driver
- **Express Session** - Session management
- **Nodemailer** - Dërgimi i emailave
- **JWT** - Authentication për admin
- **Bcrypt** - Password hashing

## 📋 Para se të Filloni

Para se të filloni, sigurohuni që keni instaluar:
- [Node.js](https://nodejs.org/) (v18 ose më të lartë)
- [MySQL](https://dev.mysql.com/downloads/mysql/) (v8 ose më të lartë)
- npm package manager
- [XAMPP](https://www.apachefriends.org/) (opsionale, për MySQL dhe phpMyAdmin)

## 🔧 Instalimi

### 1. Shkarkoni projektin
```bash
git clone <repo-url>
cd Shop
```

### 2. Instaloni dependencat e backend
```bash
npm install
```

### 3. Instaloni dependencat e frontend (për panelin admin)
```bash
cd client
npm install
cd ..
```

### 4. Konfiguroni databazën MySQL

Hapni phpMyAdmin ose MySQL Workbench dhe:

1. Krijoni databazën:
```sql
CREATE DATABASE shop_163 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Importoni strukturën nga `database.sql`:
```bash
mysql -u root -p shop_163 < database.sql
```

Ose ekzekutoni SQL-në manualisht:
```sql
CREATE TABLE perdoruesit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    fjalekalimi VARCHAR(255) NOT NULL
);

CREATE TABLE produktet (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emri VARCHAR(255) NOT NULL,
    pershkrimi TEXT,
    cmimi DECIMAL(10,2) NOT NULL,
    stoku INT NOT NULL DEFAULT 0,
    foto VARCHAR(255)
);

CREATE TABLE blerjet (
    id INT AUTO_INCREMENT PRIMARY KEY,
    perdoruesi_id INT NOT NULL,
    produkti_id INT NOT NULL,
    sasia INT NOT NULL,
    cmimi_total DECIMAL(10,2) NOT NULL,
    data_e_blerjes TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (perdoruesi_id) REFERENCES perdoruesit(id),
    FOREIGN KEY (produkti_id) REFERENCES produktet(id)
);
```

### 5. Konfiguroni lidhjen me databazën

Hapni `logjika/logjika.js` dhe verifikoni kredencialet e MySQL:
```javascript
const connection = mysql2.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',  // Vendosni password-in tuaj nëse keni
    database: 'shop_163'
})
```

### 6. Shtoni produkte të testuara (Opsionale)

Ekzekutoni `add-products.sql` për të shtuar produkte të testuara:
```bash
mysql -u root -p shop_163 < add-products.sql
```

## 🚀 Si të Startoni Aplikacionin

### Mënyra 1: Vetëm Backend (Dyqani Online)
```bash
npm start
# ose
node server.js
```
Dyqani hapet në: http://localhost:3000

### Mënyra 2: Backend + Frontend (Me Panelin Admin)
```bash
npm run dev:all
```
Kjo starto të dy serverët njëkohësisht:
- Dyqani Online: http://localhost:3000
- Paneli Admin: http://localhost:5173

### Vetëm Paneli Admin (Frontend)
```bash
npm run client
```

### Production Build
```bash
cd client
npm run build
cd ..
npm start
```

## 📱 Si të Përdorni Aplikacionin

### Dyqani Online (Për Klientët)

1. **Faqja Kryesore** - http://localhost:3000
   - Shikoni të gjitha produktet
   - Përdorni kërkimin për të gjetur produkte
   - Klikoni në produkt për detaje

2. **Regjistrimi dhe Kyçja**
   - Klikoni "Regjistrohu" për të krijuar llogari të re
   - Kyçuni me email dhe fjalëkalim
   - Menaxhoni profilin tuaj te "Profili"

3. **Blerja e Produkteve**
   - Shikoni detajet e produktit
   - Zgjidhni sasinë që dëshironi
   - Klikoni "Blej Tani"
   - Merrni faturën automatikisht

4. **Porositë e Mia**
   - Shikoni të gjitha porositë tuaja
   - Kontrolloni faturat e mëparshme
   - Ndiqni historikun e blerjeve

### Paneli Administrativ

1. **Hyrja në Panel** - http://localhost:3000/admin/login
   - Kyçuni me kredencialet e administratorit

2. **Dashboard**
   - Shikoni statistika të përgjithshme
   - Monitoroni shitjet dhe trendet
   - Kontrolloni stokun e produkteve

3. **Menaxhimi i Produkteve**
   - Shtoni produkte të reja
   - Editoni produkte ekzistuese
   - Fshini produkte
   - Menaxhoni stokun

4. **Menaxhimi i Porosive**
   - Shikoni të gjitha porositë
   - Përditësoni statusin e porosive
   - Filtroni dhe kërkoni porosi

5. **Menaxhimi i Përdoruesve**
   - Shikoni të gjithë përdoruesit
   - Editoni detajet e përdoruesve
   - Menaxhoni rolet

## 🗄️ Struktura e Databazës (MySQL)

### Tabela: produktet
```sql
id INT PRIMARY KEY AUTO_INCREMENT
emri VARCHAR(255)           -- Emri i produktit
pershkrimi TEXT             -- Përshkrimi i produktit
cmimi DECIMAL(10,2)         -- Çmimi
stoku INT                   -- Sasia në stok
foto VARCHAR(255)           -- URL e fotos
```

### Tabela: perdoruesit
```sql
id INT PRIMARY KEY AUTO_INCREMENT
emri VARCHAR(255)           -- Emri i plotë
email VARCHAR(255) UNIQUE   -- Email (unik)
fjalekalimi VARCHAR(255)    -- Fjalëkalimi (i enkriptuar)
```

### Tabela: blerjet
```sql
id INT PRIMARY KEY AUTO_INCREMENT
perdoruesi_id INT           -- Referenca te perdoruesit
produkti_id INT             -- Referenca te produkti
sasia INT                   -- Sasia e porositur
cmimi_total DECIMAL(10,2)   -- Çmimi total
data_e_blerjes TIMESTAMP    -- Data e blerjes
```

## 🔐 Routes (Rrugët e Aplikacionit)

### Dyqani Online
- `GET /` - Faqja kryesore (lista e produkteve)
- `GET /produkti/:id` - Detajet e produktit
- `GET /login` - Faqja e kyçjes
- `POST /login` - Kyçja e përdoruesit
- `GET /register` - Faqja e regjistrimit
- `POST /register` - Regjistrimi i përdoruesit të ri
- `GET /profili` - Profili i përdoruesit
- `POST /ndrysho_profilin` - Përditësimi i profilit
- `GET /orders` - Porositë e përdoruesit
- `POST /blej_produktin` - Blerja e produktit
- `GET /fatura/:id` - Shikimi i faturës
- `GET /logout` - Dalja nga llogaria

### Paneli Administrativ
- `GET /admin/login` - Kyçja e administratorit
- `POST /admin/login` - Autentifikimi i administratorit
- `GET /admin` - Dashboard i administratorit
- `GET /admin/products` - Menaxhimi i produkteve
- `POST /admin/products/add` - Shtimi i produktit
- `POST /admin/products/update` - Përditësimi i produktit
- `POST /admin/products/delete` - Fshirja e produktit
- `GET /admin/orders` - Menaxhimi i porosive
- `GET /admin/users` - Menaxhimi i përdoruesve
- `GET /admin/logout` - Dalja nga paneli admin

## 📁 Struktura e Projektit

```
Shop/
├── client/                     # React frontend (Paneli Admin)
│   ├── src/
│   │   ├── components/        # Komponentë të ripërdorshëm
│   │   │   └── AdminLayout.tsx
│   │   ├── pages/             # Faqet e panelit admin
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Orders.tsx
│   │   │   └── Users.tsx
│   │   ├── services/          # API service layer
│   │   │   ├── api.ts
│   │   │   └── index.ts
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx            # Komponenti kryesor
│   │   └── main.tsx           # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── faqet/                      # EJS templates (Dyqani Online)
│   ├── navbar.ejs             # Navigimi (desktop & mobile)
│   ├── footer.ejs             # Footer
│   ├── faqja_kryesore.ejs     # Faqja kryesore
│   ├── produkti.ejs           # Detajet e produktit
│   ├── login.ejs              # Kyçja
│   ├── register.ejs           # Regjistrimi
│   ├── profili.ejs            # Profili i përdoruesit
│   ├── orders.ejs             # Porositë e përdoruesit
│   ├── fatura.ejs             # Fatura
│   ├── 404.ejs                # Faqja e gabimit
│   └── admin/                 # Template të admin (EJS)
│       ├── login.ejs
│       ├── dashboard.ejs
│       ├── products.ejs
│       ├── orders.ejs
│       └── users.ejs
├── logjika/                    # Business logic
│   └── logjika.js             # Të gjitha funksionet e logjikës
├── server.js                   # Server kryesor (Express)
├── database.sql                # SQL schema
├── add-products.sql            # Produkte të testuara
├── add-product.js              # Script për shtim produkti
├── setup-database.js           # Setup i databazës
├── package.json                # Dependencat e backend
└── README.md                   # Dokumentacioni
```

## 🎨 Karakteristika të Detajuara

### Dyqani Online

#### Dizajn Modern
- Gradient backgrounds dhe smooth animations
- Card-based layout për produkte
- Hover effects dhe transitions
- Box shadows dhe blur effects
- Font moderne (Inter)

#### Navigation
- **Desktop**: Top navbar me search bar
- **Mobile**: Drawer navigation me overlay
- User avatar dhe profil dropdown
- Orders link i dukshëm në të dyja format

#### Kërkimi (Live Search)
- **Desktop**: Search bar në navbar me dropdown results
- **Mobile**: Full-screen search overlay
- Real-time search me debounce (300ms)
- Preview i produkteve në rezultate
- "Shiko të gjitha rezultatet" për lista të gjata

#### Faqja e Produktit
- Foto e madhe e produktit
- Informacione të detajuara
- Quantity selector me +/- buttons
- Real-time total price calculation
- Stock availability indicator
- Disabled state për produkte pa stok
- "Jo në Stok" badge

#### Sistemi i Porosive
- Lista e porosive me card design
- Order ID, data, sasia, çmimi total
- Link për faturë dhe produkt
- "Porositë e Mia" në navigim
- Empty state për përdorues pa porosi

#### Responsive Design
- Mobile drawer navigation
- Grid layout që adaptohet
- Touch-friendly buttons
- Optimizuar për të gjitha paisjet

### Paneli Administrativ

#### Material UI Design
- Professional admin interface
- Data tables me sorting
- Modal dialogs për CRUD
- Toast notifications
- Responsive admin layout

#### Dashboard Analytics
- Produkte, përdorues, porosi, të ardhura
- Sales charts (Recharts)
- Top selling products
- Low stock alerts

#### Product Management
- Searchable product table
- Add/Edit forms me validation
- Delete confirmation
- Stock tracking
- Real-time updates

## 🔒 Siguria

- Session-based authentication për dyqanin
- JWT authentication për panelin admin
- Password validation
- SQL injection prevention (përdorim i parametrave)
- Protected routes (redirect nëse nuk je i kyçur)
- Role-based access për admin
- CORS configuration për API
- Input validation në të gjitha format

## 🐛 Troubleshooting (Zgjidhje Problemesh)

### Gabim në Lidhjen me MySQL
```bash
Error databaza : connect ECONNREFUSED 127.0.0.1:3306
```
**Zgjidhja**: 
- Sigurohuni që MySQL është duke u ekzekutuar
- Verifikoni kredencialet në `logjika/logjika.js`
- Kontrolloni që databaza `shop_163` ekziston

### Porti 3000 Tashmë në Përdorim
```bash
Error: listen EADDRINUSE: address already in use :::3000
```
**Zgjidhja**: 
```bash
# Gjeni procesin që po përdor portin 3000
netstat -ano | findstr :3000
# Mbyllni procesin (zëvendësoni PID me numrin e procesit)
taskkill /PID <PID> /F
```

### Mungon Moduli
```bash
Error: Cannot find module 'xyz'
```
**Zgjidhja**: 
```bash
# Instaloni dependencat përsëri
npm install
cd client
npm install
cd ..
```

### Databaza Nuk Ka Tabela
**Zgjidhja**: Importoni `database.sql` në MySQL:
```bash
mysql -u root -p shop_163 < database.sql
```

### Nuk Shfaqen Produkte
**Zgjidhja**: Shtoni produkte duke përdorur:
```bash
mysql -u root -p shop_163 < add-products.sql
```
Ose përdorni panelin admin për të shtuar produkte.

## 📝 Shënime për Zhvilluesit

### Struktura e Kodit
- **EJS Templates**: Të gjitha faqet e dyqanit janë në `/faqet`
- **Business Logic**: Logjika e backend është në `/logjika/logjika.js`
- **Frontend Admin**: React app në `/client` (Vite + TypeScript)
- **Routing**: Të gjitha rrugët janë të deklaruara në `server.js`

### Session Management
- Session data ruhet në memory (jo për production)
- Session përmban: `isLoggedIn`, `perdoruesi` (id, emri, email)
- Session cookie expires kur mbyllet browseri

### Email Configuration
- Nodemailer është i konfiguruar për localhost:1025
- Për testing përdorni [MailHog](https://github.com/mailhog/MailHog) ose [MailDev](https://github.com/maildev/maildev)
- Për production konfiguroni SMTP real (Gmail, SendGrid, etj.)

### Styling
- Nuk përdoret asnjë framework CSS (Bootstrap, Tailwind, etj.)
- Të gjitha stilet janë vanilla CSS brenda `<style>` tags
- Responsive design me media queries
- CSS variables për colors dhe spacing

### Database Connection
- Connection pool: një connection e vetme (jo për production)
- Password të paenkriptuara në DB (jo për production!)
- Për production përdorni bcrypt për password hashing

### Gjuha Shqipe
- Të gjitha tekstet janë në shqip
- Variablat dhe funksionet janë në shqip (emri, pershkrimi, perdoruesi, etj.)
- Comments në shqip për lehtësi të mirëmbajtjes


## 👨‍💻 Zhvilluar Nga

**Ezan M Nebija**

Ndërtuar me ❤️ duke përdorur:
- Node.js & Express.js
- MySQL
- EJS Templates
- React & TypeScript
- Material UI
- Vanilla CSS & JavaScript

---

*E-commerce - Një dyqan online modern dhe profesional në gjuhën shqipe* 🇦🇱
