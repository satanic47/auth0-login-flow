# 🔐 Auth0 Modern Log-in Flow

> A production-grade, zero-dependency authentication starter featuring **Auth0 Universal Login**, **Social SSO (Google, GitHub)**, **Decoded JWT Claims Inspection**, and **Protected API Call Simulation**.

Built for **Major League Hacking (MLH) Global Hack Week: Builders Week**  
**Challenge:** *Set up your first Auth0 log-in flow* (`01a1ad39-4d0f-537e-2c5a-db384ced0d8e`)

---

## 🌟 Features

- **🛡️ Universal Login Integration**: Secure, delegated authentication handling redirection and popups via `@auth0/auth0-spa-js`.
- **🌐 Social & Database Authentication**: Instant support for Google, GitHub, and Email/Password out of the box.
- **👤 OpenID Connect Profile Viewer**: Displays user avatar, verified email status, user ID (`sub`), nickname, and timestamps.
- **📜 Decoded JWT Claims Inspector**: Formatted JSON viewer of the cryptographically verified ID Token with one-click copy.
- **⚡ Simulated Protected API Call**: Demonstrates silent access token acquisition (PKCE flow) and Authorization Bearer header formatting.
- **⚙️ Dynamic Tenant Configuration**: Settings drawer modal allows switching domains and client IDs directly in the browser.
- **📱 Fully Responsive Cyber-Themed UI**: Built with custom CSS variables, dark mode styling, and mobile responsiveness.

---

## 🛠️ Architecture & Tech Stack

- **Authentication Provider**: [Auth0 by Okta](https://auth0.com)
- **Frontend SDK**: `@auth0/auth0-spa-js` (Official Single Page App SDK)
- **Languages**: HTML5, Vanilla JavaScript (ES2022), CSS3
- **Local Dev Server**: Python 3 standard library (`http.server`)

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the Repository
```bash
git clone https://github.com/satanic47/auth0-login-flow.git
cd auth0-login-flow
```

### 2. Configure Auth0 Application Settings
In your [Auth0 Dashboard](https://manage.auth0.com):
1. Navigate to **Applications** → **Applications** → Click your **Single Page Application** (or **Default App**).
2. Note your **Domain** and **Client ID** (pre-configured in `auth_config.json`).
3. Under **Application URIs**, add the following:
   - **Allowed Callback URLs**: `http://localhost:3000, https://satanic47.github.io/auth0-login-flow/`
   - **Allowed Logout URLs**: `http://localhost:3000, https://satanic47.github.io/auth0-login-flow/`
   - **Allowed Web Origins**: `http://localhost:3000, https://satanic47.github.io/auth0-login-flow/`
4. Click **Save Changes** at the bottom of the page.

### 3. Start Local Server
```bash
# Using Python (zero extra packages needed)
python server.py

# Or using npm
npm start
```

Visit [`http://localhost:3000`](http://localhost:3000) in your browser!

---

## ⚙️ Configuration File (`auth_config.json`)

```json
{
  "domain": "dev-ycggan14b30pol1n.eu.auth0.com",
  "clientId": "HDpmLjuqijvLsBJuuhnoVRhMbsyygxfv"
}
```

*Note: You can also update the Domain and Client ID directly in the web app UI by clicking the **⚙️ Settings** button in the header.*

---

## 🏆 MLH Submission Details

- **Event:** Global Hack Week: Builders Week
- **Challenge:** Set up your first Auth0 log-in flow
- **Challenge ID:** `01a1ad39-4d0f-537e-2c5a-db384ced0d8e`
- **Repository URL:** `https://github.com/satanic47/auth0-login-flow`
- **Live Demo:** `https://satanic47.github.io/auth0-login-flow/`

---

## 📄 License
MIT License. Created by [satanic47](https://github.com/satanic47).
